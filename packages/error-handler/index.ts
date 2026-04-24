export class AppError extends Error {
  public statusCode: number;
  public details?: any;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational = true, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation Failed") {
    super(message, 400);
    this.name = "ValidationError";
  }
}

// Not found Error
export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

// Authentication error
export class AuthError extends AppError {
  constructor(message = "Authentication Failed") {
    super(message, 401);
    this.name = "AuthError";
  }
}

// Forbidden Error
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

// Unprocessable Entity Error
export class UnprocessableEntityError extends AppError {
  constructor(message = "Unprocessable Entity Error") {
    super(message, 422);
    this.name = "UnprocessableEntityError";
  }
}


// Internal server error
export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
    this.name = "InternalServerError";
  }
}

//database error
export class DatabaseError extends AppError {
  constructor(message = "Something went wrong while connecting to the database") {
    super(message, 500);
    this.name = "DatabaseError";
  }
}

//Rate Limit Error
export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
    this.name = "RateLimitError";
  }
}

