import { AppError } from "./index"
import { NextFunction, Request, Response } from "express";


export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
      success: false,
      message,
      ...(err.details && { details: err.details })
    });
  }

  console.log("unhandled Error")
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  })
};
