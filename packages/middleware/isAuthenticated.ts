import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const tokens = [
            req.cookies["admin-access-token"],
            req.cookies["seller-access-token"],
            req.cookies["accessToken"],
            req.headers.authorization?.split(" ")[1]
        ].filter(Boolean);

        if (tokens.length === 0) {
            return res.status(401).json({
                message: "Unauthorized! No token.",
            });
        }

        let decoded;
        let lastError;

        for (const t of tokens) {
            try {
                decoded = jwt.verify(t, process.env.ACCESS_TOKEN_SECRET as string) as { id: string, role: "user" | "seller" | "admin" };
                break; // found a valid token!
            } catch (err) {
                lastError = err;
            }
        }

        if (!decoded) {
            return res.status(401).json({
                message: lastError?.message === "jwt expired" ? "Token expired" : "Unauthorized! Invalid token.",
            });
        }
        let account;

        if (decoded.role === "user") {
            account = await prisma.users.findUnique({
                where: {
                    id: decoded.id
                },
                include: {
                    avatar: true
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
        } else if (decoded.role === "admin") {
            account = await prisma.users.findUnique({
                where: {
                    id: decoded.id
                },
                include: {
                    avatar: true
                }
            });
            if (account && (account as any).role !== "Admin") {
                account = null;
            }
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
        } else if (decoded.role === "admin") {
            req.admin = account;
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

