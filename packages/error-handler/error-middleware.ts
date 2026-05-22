import { AppError } from "./index"
import { NextFunction, Request, Response } from "express";


export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log operational errors (4xx) cleanly, log others (5xx) with stack trace
    if (err.isOperational && statusCode < 500) {
      console.warn(`[${err.name}] ${message} (Status: ${statusCode})`);
    } else {
      console.error(err);
    }

    return res.status(statusCode).json({
      success: false,
      message,
      ...(err.details && { details: err.details })
    });
  }

  // Unhandled Errors
  console.error("Unhandled Error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
