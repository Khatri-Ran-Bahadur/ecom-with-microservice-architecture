import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies["accessToken"] || req.cookies["seller-access-token"] || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized! No token.",
            });
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { id: string, role: "user" | "seller" };
        if (!decoded) {
            return res.status(401).json({
                message: "Unauthorized! Invalid token.",
            });
        }
        let account;

        if (decoded.role === "user") {
            account = await prisma.users.findUnique({
                where: {
                    id: decoded.id
                }
            });

        } else if (decoded.role === "seller") {
            account = await prisma.sellers.findUnique({
                where: {
                    id: decoded.id
                },
                include: {
                    shop: true
                }
            });

        }
        if (!account) {
            return res.status(401).json({
                message: "Account not found.",
            });
        }
        if (decoded.role === "user") {
            req.user = account;
        } else if (decoded.role === "seller") {
            req.seller = account;
        }
        req.role = decoded.role;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Unauthorized! Token expired or invalid!",
        });
    }
}

export default isAuthenticated;

