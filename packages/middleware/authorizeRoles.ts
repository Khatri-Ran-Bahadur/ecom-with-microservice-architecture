import { NextFunction, Response } from "express";
import { isAuthenticated } from "./isAuthenticated";
import { AuthError } from "@packages/error-handler";

export const isSeller = async (req: any, res: Response, next: NextFunction) => {
    if (req.role !== "seller") {
        return next(new AuthError("Access denied! You are not a seller."))
    }
    next();
}

export const isUser = async (req: any, res: Response, next: NextFunction) => {
    if (req.role !== "user") {
        return next(new AuthError("Access denied! You are not a user."))
    }
    next();
}
