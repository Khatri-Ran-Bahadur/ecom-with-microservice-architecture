import Stripe from "stripe"
import { Request, Response, NextFunction } from "express";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError, NotFoundError } from "@packages/error-handler";
import { Prisma } from "@prisma/client";
import redis from "@packages/libs/radis";
import { sendEmail } from "../utils/send-email";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// All Order Controller
export const createPaymentIntent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { amount, sellerStripeAccountId, sessionId } = req.body;
        const customerAmount = Math.round(amount * 100);
        const platformAmount = Math.round(amount * 0.11);

        let paymentIntent;
        try {
            paymentIntent = await stripe.paymentIntents.create({
                amount: customerAmount,
                currency: "usd",
                payment_method_types: ["card"],
                ...(sellerStripeAccountId ? {
                    transfer_data: {
                        destination: sellerStripeAccountId,
                    },
                    application_fee_amount: platformAmount,
                } : {}),
                metadata: {
                    sessionId,
                    userId: req.user?.id
                },
            });
        } catch (stripeError: any) {
            // If the seller account doesn't have transfer capabilities, fallback to platform-only charge
            if (stripeError.code === 'insufficient_capabilities_for_transfer') {
                console.warn("[ Stripe ] Seller account lacks transfer capabilities. Falling back to platform-only charge.");
                paymentIntent = await stripe.paymentIntents.create({
                    amount: customerAmount,
                    currency: "usd",
                    payment_method_types: ["card"],
                    metadata: {
                        sessionId,
                        userId: req.user?.id,
                        transfer_error: 'insufficient_capabilities'
                    },
                });
            } else {
                throw stripeError;
            }
        }

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret
        })
    } catch (error) {
        next(error);
    }
}

export const getShopOrders = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { shopId } = req.params;

        if (!shopId) {
            return res.status(400).json({ error: "Shop ID is required" });
        }

        const orders = await prisma.orders.findMany({
            where: {
                shopId: shopId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        next(error);
    }
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const adminGetOrders = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {
            page = 1,
            limit = 10,
            q,
            status,
            paymentStatus,
            deliveryStatus,
            from,
            to,
        } = req.query;

        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        const where: Prisma.OrdersWhereInput = {};

        if (status && status !== "all") where.status = String(status);
        if (paymentStatus && paymentStatus !== "all") where.paymentStatus = String(paymentStatus);
        if (deliveryStatus && deliveryStatus !== "all") where.deliveryStatus = String(deliveryStatus);

        if (from || to) {
            const createdAt: any = {};
            if (from) createdAt.gte = new Date(String(from));
            if (to) createdAt.lte = new Date(String(to));
            where.createdAt = createdAt;
        }

        if (q && String(q).trim().length > 0) {
            const query = String(q).trim();
            const safe = escapeRegExp(query);

            where.OR = [
                { couponCode: { contains: query, mode: "insensitive" } },
                // allow searching by ObjectId-like id fragment
                { id: { contains: query } as any },
                {
                    user: {
                        is: {
                            OR: [
                                { name: { contains: query, mode: "insensitive" } },
                                { email: { contains: query, mode: "insensitive" } },
                            ],
                        },
                    },
                } as any,
                {
                    shop: {
                        is: {
                            name: { contains: query, mode: "insensitive" },
                        },
                    },
                } as any,
            ];
        }

        const [total, orders] = await prisma.$transaction([
            prisma.orders.count({ where }),
            prisma.orders.findMany({
                where,
                include: {
                    items: { include: { product: true } },
                    user: { select: { id: true, name: true, email: true, avatar: true } },
                    shop: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limitNum,
            }),
        ]);

        return res.status(200).json({
            success: true,
            data: orders,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        return next(error);
    }
};

export const adminGetOrderById = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!id || !objectIdRegex.test(id)) {
            throw new ValidationError("Invalid Order ID format");
        }

        const order = await prisma.orders.findUnique({
            where: { id },
            include: {
                items: { include: { product: true } },
                user: { select: { id: true, name: true, email: true, avatar: true } },
                shop: { select: { id: true, name: true } },
            },
        });

        if (!order) throw new NotFoundError("Order not found");

        return res.status(200).json({ success: true, data: order });
    } catch (error) {
        return next(error);
    }
};

export const createPaymentSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cart, coupon, selectedAddressId } = req.body;

        // Calculate totalAmount and collect sellers
        let subtotal = 0;
        const shopIds = new Set<string>();

        for (const item of cart) {
            subtotal += (item.sale_price || 0) * (item.quantity || 1);
            if (item.shopId) shopIds.add(item.shopId);
        }

        const shippingFee = subtotal >= 2000 ? 0 : 120;
        const totalAmount = subtotal + shippingFee;

        // Fetch sellers for these shops
        const shops = await prisma.shops.findMany({
            where: {
                id: { in: Array.from(shopIds) }
            },
            include: {
                seller: {
                    select: {
                        stripeId: true
                    }
                }
            }
        });

        const sellers = shops.map(shop => ({
            shopId: shop.id,
            stripeAccountId: shop.seller?.stripeId || null
        }));

        const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const sessionKey = `payment-session:${sessionId}`;

        const sessionData = {
            cart,
            totalAmount,
            shippingFee,
            sellers,
            shippingAddressId: selectedAddressId || null,
            coupon: coupon || {},
            userId: req.user?.id
        };

        await redis.set(sessionKey, JSON.stringify(sessionData), "EX", 3600); // 1 hour expiry

        res.status(200).json({
            success: true,
            sessionId
        });
    } catch (error) {
        console.error("createPaymentSession error:", error);
        next(error);
    }
}

export const verifyPaymentSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.query;
        const sessionKey = `payment-session:${sessionId}`;
        const sessionDataStr = await redis.get(sessionKey);

        if (!sessionDataStr) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        const sessionData = JSON.parse(sessionDataStr);
        res.status(200).json({
            success: true,
            session: sessionData
        });
    } catch (error) {
        next(error);
    }
}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stripeSignature = req.headers["stripe-signature"];

        if (!stripeSignature) {
            return res.status(400).send("Missing Stripe signature");
        }

        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!endpointSecret) {
            return res.status(400).send("Missing Stripe webhook secret");
        }
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                stripeSignature,
                endpointSecret
            );
            console.log("[ Webhook Success ] Event received:", event.type);


        } catch (error) {
            console.log("Webhook signature verification failed", error);
            return res.status(400).send("Invalid webhook signature");

        }


        if (event.type === 'payment_intent.succeeded' || event.type === 'charge.succeeded') {
            const paymentIntent = event.data.object as any;
            const sessionId = paymentIntent.metadata.sessionId as string;
            const userId = paymentIntent.metadata.userId as string;

            if (!sessionId) return res.status(200).send("No sessionId in metadata");

            const sessionKey = `payment-session:${sessionId}`;
            const sessionDataStr = await redis.get(sessionKey);

            if (!sessionDataStr) {
                return res.status(200).send("Session not found, skipping order creation");
            }

            const sessionData = JSON.parse(sessionDataStr);
            const { cart, totalAmount, coupon } = sessionData;

            const user = await prisma.users.findUnique({
                where: {
                    id: userId
                }
            })
            if (!user) {
                return res.status(200).send("User not found, skipping order creation");
            }

            const shopGrouped = cart.reduce((acc: any, item: any) => {
                const shopId = item.shopId;
                if (!acc[shopId]) {
                    acc[shopId] = []
                }
                acc[shopId].push(item);
                return acc;
            }, {})

            let couponIncremented = false;
            let appliedShipping = false;

            for (const shopId in shopGrouped) {
                const orderItems = shopGrouped[shopId];
                let orderTotal = orderItems.reduce((sum: number, p: any) => sum + (p.sale_price || p.price) * p.quantity, 0);

                if (!appliedShipping && sessionData.shippingFee) {
                    orderTotal += sessionData.shippingFee;
                    appliedShipping = true;
                }

                if (coupon && coupon.discountedProductId && orderItems.some((item: any) => item.id === coupon.discountedProductId)) {
                    const discountedItem = orderItems.find((item: any) => item.id === coupon.discountedProductId);
                    if (discountedItem) {
                        const discount = coupon.discountPercent > 0 ? (discountedItem.sale_price * discountedItem.quantity * coupon.discountPercent / 100) : coupon.discountAmount;
                        orderTotal -= discount;
                    }
                }

                // Check if order already exists
                const existingOrder = await prisma.orders.findFirst({
                    where: {
                        userId: userId,
                        shopId: shopId,
                        total: orderTotal,
                        createdAt: {
                            gte: new Date(Date.now() - 10000) // Within 10 seconds
                        }
                    }
                });

                if (existingOrder) continue;

                //create order
                const newOrder = await prisma.orders.create({
                    data: {
                        userId: userId,
                        shopId: shopId,
                        total: orderTotal,
                        status: "Paid",
                        paymentStatus: "Paid",
                        shippingAddressId: sessionData.shippingAddressId || null,
                        couponCode: coupon?.code || null,
                        discountAmount: coupon?.discountAmount || 0,
                        items: {
                            create: orderItems.map((item: any) => ({
                                productId: item.id || item.productId,
                                quantity: item.quantity,
                                price: item.sale_price || item.price,
                                selectedOptions: item.selectedOptions || {}
                            }))
                        }
                    }
                });

                if (coupon && coupon.code && !couponIncremented) {
                    await prisma.discount_codes.update({
                        where: { discountCode: coupon.code },
                        data: { usedCount: { increment: 1 } }
                    });
                    couponIncremented = true;
                }

                // Update product stock
                for (const item of orderItems) {
                    await prisma.products.update({
                        where: { id: item.id || item.productId },
                        data: {
                            stock: { decrement: item.quantity },
                            totalSales: { increment: item.quantity }
                        }
                    });
                }

                // Send email
                try {
                    await sendEmail({
                        email: user.email,
                        subject: "Order Confirmation",
                        template: "order-confirmation.ejs",
                        data: {
                            user: user,
                            order: newOrder,
                            orderId: newOrder.id
                        }
                    });
                } catch (e) {
                    console.error("Email error:", e);
                }
            }
        }

        res.status(200).send("Webhook handled");
    } catch (error) {
        console.error("Error in order controller => ", error);
        next(error);
    }
}

export const getSellerOrders = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, status, startDate, endDate } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const shop = await prisma.shops.findUnique({
            where: {
                sellerId: req.seller.id,
            }
        });

        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        const where: any = { shopId: shop.id };
        if (status && status !== 'all') where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate as string);
            if (endDate) {
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        const [orders, total] = await Promise.all([
            prisma.orders.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true, avatar: { select: { url: true } } } },
                    items: { include: { product: true } }
                },
                orderBy: { createdAt: "desc" },
                skip: Number(skip),
                take: Number(limit),
            }),
            prisma.orders.count({ where })
        ]);

        return res.status(200).json({
            success: true,
            data: orders,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error)
    }
}

export const getSellerOrderById = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({ success: false, message: "Invalid Order ID format" });
        }

        const shop = await prisma.shops.findUnique({ where: { sellerId: req.seller.id } });
        const order = await prisma.orders.findFirst({
            where: { id, shopId: shop?.id },
            include: {
                user: { select: { id: true, name: true, email: true, avatar: { select: { url: true } } } },
                items: { include: { product: true } }
            }
        }) as any;

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (order.shippingAddressId) {
            order.shippingAddress = await prisma.address.findUnique({ where: { id: order.shippingAddressId } });
        }

        return res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
}

export const updateOrderStatus = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        console.log("[ Order Service ] Updating status for order:", id);

        // Validate ObjectId
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({ success: false, message: "Invalid Order ID format" });
        }

        const { status, deliveryStatus } = req.body;
        console.log("[ Order Service ] Payload:", { status, deliveryStatus });

        const shop = await prisma.shops.findUnique({ where: { sellerId: req.seller.id } });
        if (!shop) {
            console.error("[ Order Service ] Shop not found for seller:", req.seller.id);
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        const order = await prisma.orders.findFirst({ where: { id, shopId: shop.id } });
        if (!order) {
            console.error("[ Order Service ] Order not found or not owned by shop:", { id, shopId: shop.id });
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        const updatedOrder = await prisma.orders.update({
            where: { id },
            data: {
                status: status || order.status,
                deliveryStatus: deliveryStatus || order.deliveryStatus
            }
        });

        console.log("[ Order Service ] Order updated successfully:", updatedOrder.id);
        return res.status(200).json({ success: true, data: updatedOrder });
    } catch (error) {
        console.error("[ Order Service ] Update error:", error);
        next(error);
    }
}

//verify coupon controller

export const verifyCoupon = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { couponCode, cart } = req.body;

        if (!couponCode || !cart || cart.length === 0) {
            return next(new ValidationError("Invalid coupon or cart"));
        }

        const discount = await prisma.discount_codes.findUnique({ where: { discountCode: couponCode } });
        if (!discount) return res.status(404).json({ success: false, message: "Coupon not found" });

        if (!discount.isActive) {
            return res.status(200).json({ valid: false, message: "Coupon is not active" });
        }

        if (discount.expiryDate && new Date(discount.expiryDate) < new Date()) {
            return res.status(200).json({ valid: false, message: "Coupon has expired" });
        }

        if (discount.usageLimit > 0 && discount.usedCount >= discount.usageLimit) {
            return res.status(200).json({ valid: false, message: "Coupon usage limit reached" });
        }

        const matchingProduct = cart.find((item: any) => item.discount_codes?.some((d: any) => d === discount.id));

        if (!matchingProduct) {
            return res.status(200).json({ valid: false, discount: 0, discountAmount: 0, discountPercentage: 0, discountedProductId: "", message: "Coupon not valid for this cart" });
        }

        let discountAmount = 0;

        const price = matchingProduct.sale_price * matchingProduct.quantity;
        if (discount.discountType === "percentage") {
            discountAmount = price * (discount.discountValue / 100);
        } else if (discount.discountType === "fixed") {
            discountAmount = discount.discountValue;
        }

        discountAmount = Math.min(discountAmount, price);


        return res.status(200).json({
            valid: true,
            discount: discount.discountValue,
            discountAmount: discountAmount.toFixed(2),
            discountProductId: matchingProduct.id,
            discountType: discount.discountType,
            message: "Coupon applied successfully"

        });

    } catch (error) {
        next(error);
    }
}
// get user orders
export const getUserOrders = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const orders = await prisma.orders.findMany({
            where: { userId },
            include: {
                shop: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        return next(error);
    }
}

// get user order by id
export const getUserOrderById = async (req: any, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;
        const userId = req.user?.id;

        // Validate ObjectId
        if (!/^[0-9a-fA-F]{24}$/.test(orderId)) {
            return res.status(400).json({ success: false, message: "Invalid Order ID format" });
        }

        const order = await prisma.orders.findUnique({
            where: {
                id: orderId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                        shop: true
                    }
                }
            }
        });

        if (!order || order.userId !== userId) {
            return next(new NotFoundError("Order not found"));
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        return next(error);
    }
}
