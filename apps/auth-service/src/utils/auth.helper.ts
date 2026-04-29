import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { ValidationError } from "@packages/error-handler";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";
import prisma from "@packages/libs/prisma";


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const hashPassword = async (password: string) => {
    return crypto.createHash("sha256").update(password).digest("hex");
}

export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
    const { name, email, password, phone_number, country } = data;

    if (!name || !email || !password || (userType === "seller" && (!phone_number || !country))) {
        throw new ValidationError("All fields are required");
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid email");
    }

    // if (userType === "seller" && !phoneRegex.test(phone_number)) {
    //     throw new ValidationError("Invalid phone number");
    // }

}

export const checkOtpRestrictions = async (email: string, next: NextFunction) => {
    if (await redis.get(`otp_lock:${email}`)) {
        return next(new ValidationError("Account locked due to multiple faield attempts! Try again after 30 minutes"));
    }

    if (await redis.get(`otp_spam_lock:${email}`)) {
        return next(new ValidationError("Too many OTP requests! Please wait 1hour before requesting again"));
    }

    if (await redis.get(`otp_cooldown:${email}`)) {
        return next(new ValidationError("Please wait 1 minute before requesting again a new OTP!"));
    }


}

export const trackOtpRequests = async (email: string, next: NextFunction) => {
    const otpRequestKey = `otp_request_count :${email}`;
    const otpRequests = parseInt(await redis.get(otpRequestKey) || "0");

    if (otpRequests >= 2) {
        await redis.set(`otp_spam_lock:${email}`, "true", "EX", 60 * 60);
        return next(new ValidationError("Too many OTP requests! Please wait 1hour before requesting again"));
    }

    await redis.set(otpRequestKey, otpRequests + 1, "EX", 60 * 60);
}

export const sendOtp = async (email: string, name: string, template: string) => {
    const otp = crypto.randomInt(1000, 9999).toString();

    const isSent = await sendEmail(email, "Verify your email", template, { name, otp })
    if (!isSent) {
        throw new ValidationError("Failed to send OTP email. Please try again later.");
    }

    console.log("OTP sent to email. Please verify your account.");

    await redis.set(`otp:${email}`, otp, "EX", 60 * 5);
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60 * 5);
}


export const verifyOtp = async (email: string, otp: string, next: NextFunction) => {
    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp) {
        throw new ValidationError("OTP has expired. Please request a new one.");
    }

    const failedAttemptsKey = `otp_attempts:${email}`;
    const failedAttempts = parseInt(await redis.get(failedAttemptsKey) || "0");


    if (storedOtp !== otp) {
        if (failedAttempts >= 2) {
            await redis.set(`otp_lock:${email}`, "true", "EX", 60 * 30);
            await redis.del(`otp:${email}`);
            // await redis.del(`otp_request_count:${email}`);
            // await redis.del(`otp_cooldown:${email}`);
            return next(new ValidationError("Too many incorrect OTP attempts. Please try again after 30 minutes."));
        }
        await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 60 * 30);
        return next(new ValidationError(`Incorrect OTP. ${2 - failedAttempts} attempts left.`));
    }

    await redis.del(`otp:${email}`, failedAttemptsKey);
    // await redis.del(`otp_request_count:${email}`);
    // await redis.del(`otp_cooldown:${email}`);
}


// handle forgot password
export const handleForgotPassword = async (req: Request, res: Response, next: NextFunction, userType: "user" | "seller") => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new ValidationError("Email is required");
        }
        const user = userType === "user" ? await prisma.users.findUnique({
            where: { email }
        }) : await prisma.sellers.findUnique({
            where: { email }
        });
        if (!user) {
            throw new ValidationError(`${userType} not found`);
        }
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        await sendOtp(email, user.name, userType === "user" ? "forgot-password-user-mail" : "forgot-password-seller-mail");

        res.status(200).json({
            message: "OTP sent to email. Please verify your account."
        })
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

// verify forgot password otp
export const verifyForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return next(new ValidationError("All fields are required"));
        }
        await verifyOtp(email, otp, next);
        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        })
    } catch (error) {
        console.log(error);
        return next(error);
    }
}

//


