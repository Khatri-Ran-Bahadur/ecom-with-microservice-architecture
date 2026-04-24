import { NextFunction, Request, Response } from "express";
import { validateRegistrationData, checkOtpRestrictions, trackOtpRequests, sendOtp, verifyOtp } from "../utils/auth.helper";
import { setTokenCookie } from "../utils/cookies/setCookie";
import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");
        const { name, email } = req.body;

        const existingUser = await prisma.users.findUnique({
            where: { email }
        });

        if (existingUser) {
            return next(new ValidationError("User already exists with this email!"));
        }

        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        await sendOtp(email, name, "user-activation-mail");

        res.status(200).json({
            message: "OTP sent to email. Please verify your account."
        })
    } catch (error) {
        console.log(error);
        return next(error);
    }

}

// verify otp
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password, name } = req.body;

        if (!email || !otp || !password || !name) {
            return next(new ValidationError("All fields are required"));
        }

        await verifyOtp(email, otp, next);
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
        console.log(error);
        return next(error);
    }
}

//login user
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ValidationError("All fields are required"));
        }

        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) {
            return next(new ValidationError("User not found"));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return next(new ValidationError("Invalid password"));
        }

        const accessToken = jwt.sign({ id: user.id, role: "user" }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });

        const refreshToken = jwt.sign({ id: user.id, role: "user" }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: "7d" });

        //store he refresh and access token in a httpOnly secure cookie
        setTokenCookie(res, "accessToken", accessToken);
        setTokenCookie(res, "refreshToken", refreshToken);


        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            accessToken,
            user
        })

    } catch (error) {
        console.log(error);
        return next(error);
    }
}