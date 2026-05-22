import { NextFunction, Request, Response } from "express";
import { validateRegistrationData, checkOtpRestrictions, trackOtpRequests, sendOtp, verifyOtp, handleForgotPassword, verifyForgotPasswordOtp as verifyForgotPasswordOtpHelper } from "../utils/auth.helper";
import { setTokenCookie } from "../utils/cookies/setCookie";
import { AuthError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    // Keep in sync with the Stripe types bundled with `stripe` package version in this repo
    apiVersion: "2026-04-22.dahlia",
});


export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");
        const { name, email } = req.body;

        const existingUser = await prisma.users.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new ValidationError("User already exists with this email!");
        }

        await checkOtpRestrictions(email);
        await trackOtpRequests(email);
        await sendOtp(email, name, "user-activation-mail");

        res.status(200).json({
            message: "OTP sent to email. Please verify your account."
        })
    } catch (error) {
        return next(error);
    }

}

// verify otp
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name } = req.body;

        if (!email || !otp || !password || !name) {
            throw new ValidationError("All fields are required");
        }

        await verifyOtp(email, otp);
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.users.create({
            data: {
                email,
                password: hashedPassword,
                name,
            }
        })

        res.status(201).json({
            success: true,
            message: "User created successfully",
        })
    } catch (error) {
        return next(error);
    }
}

//login user
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ValidationError("All fields are required");
        }

        const user = await prisma.users.findUnique({
            where: { email }, include: { avatar: true }
        });

        if (!user) {
            throw new ValidationError("User not found");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ValidationError("Invalid password");
        }

        res.clearCookie("seller-access-token");
        res.clearCookie("seller-refresh-token");

        const accessToken = jwt.sign({ id: user.id, role: "user" }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user.id, role: "user" }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

        //store he refresh and access token in a httpOnly secure cookie
        setTokenCookie(res, "accessToken", accessToken);
        setTokenCookie(res, "refreshToken", refreshToken);


        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            accessToken,
            user: {
                id: user.id, name: user.name, email: user.email, avatar: user.avatar
            }
        })

    } catch (error) {
        return next(error);
    }
}

//refresj token user
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken =
            req.cookies["admin-refresh-token"] ||
            req.cookies["refreshToken"] ||
            req.cookies["seller-refresh-token"] ||
            req.headers.authorization?.split(" ")[1];

        if (!refreshToken) {
            throw new ValidationError("Unauthorized! No refresh token.");
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { id: string; role: string };

        if (!decoded || !decoded.id || !decoded.role) {
            throw new ValidationError("Unauthorized! Invalid token.");
        }

        let account;
        if (decoded.role === "user") {
            account = await prisma.users.findUnique({ where: { id: decoded.id }, include: { avatar: true } });
            if (!account) {
                throw new AuthError("Forbidden! User not found");
            }
        } else if (decoded.role === "seller") {
            account = await prisma.sellers.findUnique({ where: { id: decoded.id }, include: { shop: true } });
            if (!account) {
                throw new AuthError("Forbidden! Seller not found");
            }
        } else if (decoded.role === "admin") {
            account = await prisma.users.findUnique({ where: { id: decoded.id }, include: { avatar: true } });
            if (!account || account.role !== "Admin") {
                throw new AuthError("Forbidden! Admin not found");
            }
        }


        if (!account) {
            throw new AuthError("Forbidden! User/Seller not found");
        }
        const accessToken = jwt.sign({ id: account.id, role: decoded.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });

        if (decoded.role === "user") {
            setTokenCookie(res, "accessToken", accessToken);
            res.status(200).json({
                success: true,
                message: `${decoded.role} refreshed token successfully`,
                accessToken
            })
        } else if (decoded.role === "seller") {
            setTokenCookie(res, "seller-access-token", accessToken);
            res.status(200).json({
                success: true,
                message: `${decoded.role} refreshed token successfully`,
                accessToken
            })
        } else if (decoded.role === "admin") {
            setTokenCookie(res, "admin-access-token", accessToken);
            res.status(200).json({
                success: true,
                message: `${decoded.role} refreshed token successfully`,
                accessToken
            })
        }
    } catch (error) {
        return next(error);
    }
}

//get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        return next(error);
    }
}

//user forgot password
export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, next, 'user');
}

//Verify forgot password OTP
export const verifyForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPasswordOtpHelper(req, res, next);
}

// upload user avatar
// update user avatar
export const updateAvatar = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { avatar } = req.body;

        if (!avatar || !avatar.file_id || !avatar.url) {
            throw new ValidationError("Avatar data (file_id and url) is required");
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                avatar: {
                    upsert: {
                        create: {
                            file_id: avatar.file_id,
                            url: avatar.url
                        },
                        update: {
                            file_id: avatar.file_id,
                            url: avatar.url
                        }
                    }
                }
            },
            include: {
                avatar: true
            }
        });

        res.status(200).json({
            success: true,
            message: "Avatar updated successfully",
            user: updatedUser
        });
    } catch (error) {
        return next(error);
    }
}


//Reset User Password
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            throw new ValidationError("Email and new password are required");
        }

        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) {
            throw new ValidationError("User not found");
        }
        //compare new password with old password if same then return error
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new ValidationError("New password cannot be the same as the old password!");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { email },
            data: {
                password: hashedPassword
            }
        })

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
        })
    } catch (error) {
        return next(error);
    }
}

//register a new seller
export const registerSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "seller");
        const { name, email } = req.body;

        const existingSeller = await prisma.sellers.findUnique({
            where: { email }
        });

        if (existingSeller) {
            throw new ValidationError("Seller already exists with this email!");
        }

        await checkOtpRestrictions(email);
        await trackOtpRequests(email);
        await sendOtp(email, name, "seller-activation");

        res.status(200).json({
            message: "OTP sent to email. Please verify your account."
        })
    } catch (error) {
        return next(error);
    }
}

// verify seller with otp
export const verifySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name, phone_number, country } = req.body;

        if (!email || !otp || !password || !name || !phone_number || !country) {
            throw new ValidationError("All fields are required");
        }

        const existingSeller = await prisma.sellers.findUnique({
            where: { email }
        });

        if (existingSeller) {
            throw new ValidationError("Seller already exists with this email!");
        }

        await verifyOtp(email, otp);
        const hashedPassword = await bcrypt.hash(password, 10);

        const seller = await prisma.sellers.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone_number,
                country
            }
        })

        res.status(201).json({
            success: true,
            message: "Seller created successfully",
            seller
        })
    } catch (error) {
        return next(error);
    }
}

// create new shop
export const createShop = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { name, bio, address, opening_hours, website, category, sellerId } = req.body;

        if (!name || !bio || !address || !opening_hours || !website || !category || !sellerId) {
            throw new ValidationError("All fields are required");
        }

        const shopData: any = {
            sellerId,
            name,
            bio,
            address,
            opening_hours,
            website,
            category
        }

        if (website && website.trim() !== "") {
            shopData.website = website;
        }

        const shop = await prisma.shops.create({
            data: shopData
        })

        res.status(201).json({
            success: true,
            message: "Shop created successfully",
        })
    } catch (error) {
        return next(error);
    }
}

// create stripe conect account link
export const createStripeAccountLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sellerId } = req.body;

        if (!sellerId) {
            throw new ValidationError("Seller ID is required");
        }

        const seller = await prisma.sellers.findUnique({
            where: { id: sellerId }
        });

        if (!seller) {
            throw new ValidationError("Seller not found");
        }

        // TODO: Implement stripeService.createAccountLink
        const account = await stripe.accounts.create({
            type: "express",
            country: "GB",
            email: seller.email,
            capabilities: {
                card_payments: {
                    requested: true
                },
                transfers: {
                    requested: true
                }
            }
        });

        await prisma.sellers.update({
            where: { id: sellerId },
            data: {
                stripeId: account.id
            }
        });

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.STRIPE_BASE_URL}/success`,
            return_url: `${process.env.STRIPE_BASE_URL}/success`,
            type: "account_onboarding"
        });

        res.status(200).json({
            success: true,
            url: accountLink.url
        })
    } catch (error) {
        return next(error);
    }
}

// login seller
export const loginSeller = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ValidationError("All fields are required");
        }

        const seller = await prisma.sellers.findUnique({
            where: { email }
        });

        if (!seller) {
            throw new ValidationError("Seller not found");
        }

        const isPasswordValid = await bcrypt.compare(password, seller.password);
        if (!isPasswordValid) {
            throw new ValidationError("Invalid password");
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        const accessToken = jwt.sign({ id: seller.id, role: "seller" }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: seller.id, role: "seller" }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

        //store he refresh and access token in a httpOnly secure cookie
        setTokenCookie(res, "seller-access-token", accessToken);
        setTokenCookie(res, "seller-refresh-token", refreshToken);

        res.status(200).json({
            success: true,
            message: "Seller logged in successfully",
            accessToken
        })
    } catch (error) {
        return next(error);
    }
}


//get logged in seller
export const getSeller = async (req: any, res: Response, next: NextFunction) => {
    try {
        const seller = req.seller;
        res.status(200).json({
            success: true,
            seller
        })
    } catch (error) {
        return next(error);
    }
}

// add shipping address
export const addUserAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { name, label, street, city, state, zip, country, isDefault } = req.body;

        if (!userId || !name || !label || !street || !city || !state || !zip || !country) {
            throw new ValidationError("All fields are required");
        }
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            })
        }

        const address = await prisma.address.create({
            data: {
                userId,
                name,
                label,
                street,
                city,
                state,
                zip,
                country,
                isDefault
            }
        })

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            address
        })
    } catch (error) {
        return next(error);
    }
}

// get address
export const getUserAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const address = await prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        })

        res.status(200).json({
            success: true,
            address
        })
    } catch (error) {
        return next(error);
    }
}

// update user address
export const updateUserAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { id, name, label, street, city, state, zip, country, isDefault } = req.body;

        if (!userId || !id || !name || !label || !street || !city || !state || !zip || !country) {
            throw new ValidationError("All fields are required");
        }
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            })
        }

        const address = await prisma.address.update({
            where: { id },
            data: {
                userId,
                name,
                label,
                street,
                city,
                state,
                zip,
                country,
                isDefault
            }
        })

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address
        })
    } catch (error) {
        return next(error);
    }
}

// delete user address
export const deleteUserAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { id } = req.body;

        if (!userId || !id) {
            throw new ValidationError("All fields are required");
        }

        await prisma.address.delete({
            where: { id }
        })

        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        })
    } catch (error) {
        return next(error);
    }
}

// set default address
export const setDefaultAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { id } = req.body;

        if (!userId || !id) {
            throw new ValidationError("All fields are required");
        }

        await prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false }
        })

        await prisma.address.update({
            where: { id },
            data: { isDefault: true }
        })

        res.status(200).json({
            success: true,
            message: "Default address set successfully",
        })
    } catch (error) {
        return next(error);
    }
}

// get user stats
export const getUserStats = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        const [orders, reviews, analytics] = await Promise.all([
            prisma.orders.findMany({
                where: { userId }
            }),
            prisma.shopReviews.count({
                where: { userId }
            }),
            prisma.userAnalytics.findUnique({
                where: { userId }
            })
        ]);

        const totalOrders = orders.length;
        const totalSpending = orders.reduce((acc, order) => acc + (order.total || 0), 0);

        res.status(200).json({
            success: true,
            stats: {
                totalOrders,
                totalSpending,
                totalReviews: reviews,
                wishlistItems: 0 // Mocked for now, depending on if there is a wishlist model
            }
        });
    } catch (error) {
        return next(error);
    }
}

// update password
export const updatePassword = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new ValidationError("Current and new passwords are required");
        }

        const user = await prisma.users.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new ValidationError("User not found");
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new ValidationError("Invalid current password");
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new ValidationError("New password cannot be the same as the old password!");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        return next(error);
    }
}

// get user notifications
export const getUserNotifications = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        const notifications = await prisma.notifications.findMany({
            where: { receiverId: userId },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        return next(error);
    }
}

// get user reviews
export const getUserReviews = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        const reviews = await prisma.shopReviews.findMany({
            where: { userId },
            include: {
                shop: true
            },
            orderBy: { createdAt: "desc" }
        });

        res.status(200).json({
            success: true,
            reviews
        });
    } catch (error) {
        return next(error);
    }
}

// update user profile
export const updateProfile = async (req: any, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { name } = req.body;

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                name
            }
        });

        res.status(200).json({
            success: true,
            user: updatedUser
        });
    } catch (error) {
        return next(error);
    }
}


export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ValidationError("All fields are required");
        }

        const admin = await prisma.users.findUnique({
            where: { email },
            include: { avatar: true },
        });

        if (!admin || admin.role !== "Admin") {
            throw new ValidationError("Admin not found");
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            throw new ValidationError("Invalid password");
        }

        // clear any other session cookies
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.clearCookie("seller-access-token");
        res.clearCookie("seller-refresh-token");
        res.clearCookie("admin-access-token");
        res.clearCookie("admin-refresh-token");


        const accessToken = jwt.sign({ id: admin.id, role: "admin" }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: admin.id, role: "admin" }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

        // Use dedicated admin cookie names so middleware can reliably select the right principal
        setTokenCookie(res, "admin-access-token", accessToken);
        setTokenCookie(res, "admin-refresh-token", refreshToken);

        res.status(200).json({
            success: true,
            message: "Admin logged in successfully",
            accessToken,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                avatar: admin.avatar
            }
        });
    } catch (error) {
        return next(error);
    }
}

// get single admin
export const getAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const admin = req.admin;
        res.status(200).json({
            success: true,
            admin
        })
    } catch (error) {
        return next(error);
    }
}