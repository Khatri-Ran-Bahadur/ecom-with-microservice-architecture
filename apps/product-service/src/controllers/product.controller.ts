import { NextFunction, Request, Response } from "express";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import { imageKit } from "@packages/libs/imagekit";


//get our product category
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await prisma.site_config.findFirst();
        if (!config) {
            return res.status(404).json({ success: false, message: "Config not found" });
        }
        res.status(200).json({
            categories: config.categories,
            subCategories: config.subCategories,
        });
    } catch (error) {
        next(error);
    }
}

// create discount code
export const createDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { public_name, discountType, discountValue, discountCode, usageLimit, isActive, expiryDate } = req.body;
        // validate
        if (!public_name || !discountType || !discountValue || !discountCode || !usageLimit || !isActive || !expiryDate) {
            return next(new ValidationError("All fields are required"));
        }
        // is this discount code exists
        const existDiscountCode = await prisma.discount_codes.findFirst({
            where: {
                discountCode,
            },
        });
        if (existDiscountCode) {
            return next(new ValidationError("Discount code already exists"));
        }

        const discount_code = await prisma.discount_codes.create({
            data: {
                public_name,
                discountType,
                discountValue: parseFloat(discountValue),
                discountCode,
                sellerId: req.seller.id,
                usageLimit: parseInt(usageLimit),
                isActive: isActive,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            }
        })
        res.status(200).json({ success: true, discount_code: discount_code });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

// get discount code
export const getDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
    try {
        const discount_codes = await prisma.discount_codes.findMany({
            where: {
                sellerId: req.seller.id,
            }
        })
        res.status(200).json({ success: true, discount_codes: discount_codes });
    } catch (error) {
        next(error);
    }
}

// delete discount code
export const deleteDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sellerId = req.seller.id;

        const discountCode = await prisma.discount_codes.findFirst({
            where: {
                id,
            },
            select: { id: true, sellerId: true }
        })

        if (!discountCode) {
            return next(new ValidationError("Discount code not found"));
        }

        if (discountCode.sellerId != sellerId) {
            return next(new ValidationError("You are not authorized to delete this discount code"));
        }

        await prisma.discount_codes.delete({
            where: {
                id
            }
        })
        res.status(200).json({ success: true, message: "Discount code deleted successfully" });
    } catch (error) {
        next(error);
    }
}

// update discount code
export const updateDiscountCode = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const sellerId = req.seller.id;
        const { public_name, discountType, discountValue, discountCode, usageLimit, isActive, expiryDate } = req.body;
        const existDiscountCode = await prisma.discount_codes.findFirst({
            where: {
                id,
            },
            select: { id: true, sellerId: true }
        })
        if (!existDiscountCode) {
            return next(new ValidationError("Discount code not found"));
        }
        if (existDiscountCode.sellerId != sellerId) {
            return next(new ValidationError("You are not authorized to update this discount code"));
        }
        const updatedDiscountCode = await prisma.discount_codes.update({
            where: {
                id
            },
            data: {
                public_name,
                discountType,
                discountValue: parseFloat(discountValue),
                discountCode,
                usageLimit: parseInt(usageLimit),
                isActive: isActive,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            }
        })
        res.status(200).json({ success: true, discount_code: updatedDiscountCode });
    } catch (error) {
        next(error);
    }
}


// upload product image
export const uploadProductImage = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body;
        if (!fileName) {
            return next(new ValidationError("File is required"));
        }

        const response = await imageKit.upload({
            file: fileName,
            fileName: `product-${Date.now()}.jpg`,
            folder: "/products",
        });
        res.status(200).json({ success: true, file_url: response.url, fileId: response.fileId });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

// delete product image
export const deleteProductImage = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body;
        if (!fileId) {
            return next(new ValidationError("File name is required"));
        }
        await imageKit.deleteFile(fileId);
        res.status(200).json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
        next(error);
    }
}



// create product
export const createProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const {
            title,
            short_description,
            detailed_description,
            warranty,
            custom_specifications = {},
            slug,
            tags = [],
            cash_on_delivery,
            brand,
            video_url = "",
            category,
            subCategory,
            colors = [],
            sizes = [],
            discount_codes = [],
            stock,
            sale_price = 0,
            regular_price,
            custom_properties = {},
            images = []
        } = req.body;

        // Validate required fields
        const requiredFields = [
            'title', 'short_description', 'detailed_description', 'slug',
            'category', 'subCategory', 'stock', 'regular_price'
        ];

        const missingFields = requiredFields.filter(field => {
            const val = req.body[field];
            return val === undefined || val === null || val === '';
        });

        const validImages = Array.isArray(images) ? images.filter(img => img !== null) : [];

        if (missingFields.length > 0 || validImages.length === 0) {
            return next(new ValidationError(`Missing required fields: ${missingFields.join(', ')}${validImages.length === 0 ? ', images' : ''}`));
        }

        if (!req.seller?.id || !req.seller?.shop?.id) {
            return next(new AuthError("You must have an active shop to create products"));
        }

        const product = await prisma.products.create({
            data: {
                title,
                short_description,
                detailed_description,
                warranty,
                slug,
                shopId: req.seller.shop.id,
                tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(",").map(t => t.trim()) : []),
                cash_on_delivery: cash_on_delivery === 'yes' || cash_on_delivery === true,
                brand,
                video_url,
                category,
                subCategory,
                colors,
                sizes,
                discount_codes: Array.isArray(discount_codes) ? discount_codes.map((id: string) => id.trim()) : [],
                stock: parseInt(stock),
                sale_price: parseFloat(sale_price.toString()),
                regular_price: parseFloat(regular_price.toString()),
                images: validImages.map((image: any) => ({
                    fileId: image.fieldId || image.fileId,
                    url: image.file_url || image.url
                })),
                custom_properties: custom_properties || {},
                custom_specifications: custom_specifications || {},
            }
        });

        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error("Create Product Error:", error);
        next(error);
    }
};

// get products for seller
export const getProducts = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, search = "", category = "", status = "" } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        if (!req.seller?.shop?.id) {
            return next(new AuthError("You must have an active shop to view products"));
        }

        const where: any = {
            shopId: req.seller.shop.id,
            isDeleted: { not: true }, // Filter out deleted products
        };

        if (search) {
            where.title = { contains: search as string, mode: "insensitive" };
        }
        if (category) {
            where.category = category as string;
        }
        if (status) {
            // Convert status string to enum case if necessary
            where.status = status as any;
        }

        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where,
                skip,
                take: parseInt(limit as string),
                orderBy: { createdAt: "desc" },
            }),
            prisma.products.count({ where }),
        ]);

        res.status(200).json({
            success: true,
            products,
            pagination: {
                total,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                totalPages: Math.ceil(total / parseInt(limit as string)),
            },
        });
    } catch (error) {
        console.error("Get Products Error:", error);
        next(error);
    }
};

// get single product
export const getProductById = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!req.seller?.shop?.id) {
            return next(new AuthError("You must have an active shop to view products"));
        }

        const product = await prisma.products.findFirst({
            where: {
                id,
                shopId: req.seller.shop.id,
                isDeleted: { not: true },
            },
        });

        if (!product) {
            return next(new ValidationError("Product not found"));
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

// delete product (soft delete)
export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!req.seller?.shop?.id) {
            return next(new AuthError("You must have an active shop to delete products"));
        }

        const product = await prisma.products.findFirst({
            where: { id, shopId: req.seller.shop.id },
        });

        if (!product) {
            return next(new ValidationError("Product not found"));
        }


        await Promise.all(deleteImages);

        await prisma.products.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date()
            },
        });

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        next(error);
    }
};


// update product
export const updateProduct = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const {
            title,
            short_description,
            detailed_description,
            warranty,
            custom_specifications = {},
            slug,
            tags = [],
            cash_on_delivery,
            brand,
            video_url = "",
            category,
            subCategory,
            colors = [],
            sizes = [],
            discount_codes = [],
            stock,
            sale_price = 0,
            regular_price,
            custom_properties = {},
            images = []
        } = req.body;

        if (!req.seller?.shop?.id) {
            return next(new AuthError("You must have an active shop to update products"));
        }

        const existingProduct = await prisma.products.findFirst({
            where: { id, shopId: req.seller.shop.id },
        });

        if (!existingProduct) {
            return next(new ValidationError("Product not found or unauthorized"));
        }

        //check seller is owner

        if (existingProduct.shopId !== req.seller.shop.id) {
            return next(new AuthError("You are not authorized to update this product"));
        }

        // Validate required fields
        const requiredFields = [
            'title', 'short_description', 'detailed_description', 'slug',
            'category', 'subCategory', 'stock', 'regular_price'
        ];

        const missingFields = requiredFields.filter(field => {
            const val = req.body[field];
            return val === undefined || val === null || val === '';
        });

        const validImages = Array.isArray(images) ? images.filter(img => img !== null) : [];

        if (missingFields.length > 0 || validImages.length === 0) {
            return next(new ValidationError(`Missing required fields: ${missingFields.join(', ')}${validImages.length === 0 ? ', images' : ''}`));
        }

        const product = await prisma.products.update({
            where: { id },
            data: {
                title,
                short_description,
                detailed_description,
                warranty,
                slug,
                tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(",").map(t => t.trim()) : []),
                cash_on_delivery: cash_on_delivery === 'yes' || cash_on_delivery === true,
                brand,
                video_url,
                category,
                subCategory,
                colors,
                sizes,
                discount_codes: Array.isArray(discount_codes) ? discount_codes.map((id: string) => id.trim()) : [],
                stock: parseInt(stock),
                sale_price: parseFloat(sale_price.toString()),
                regular_price: parseFloat(regular_price.toString()),
                images: validImages.map((image: any) => ({
                    fileId: image.fieldId || image.fileId,
                    url: image.file_url || image.url
                })),
                custom_properties: custom_properties || {},
                custom_specifications: custom_specifications || {},
            }
        });

        res.status(200).json({ success: true, product });
    } catch (error) {
        console.error("Update Product Error:", error);
        next(error);
    }
};