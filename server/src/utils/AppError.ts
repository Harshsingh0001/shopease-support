export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: "fail" | "error";
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 400);
  }

  static unauthorized(message: string = "Unauthorized"): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message: string = "Forbidden access"): AppError {
    return new AppError(message, 403);
  }

  static notFound(message: string = "Resource not found"): AppError {
    return new AppError(message, 404);
  }

  static internal(message: string = "Internal server error"): AppError {
    return new AppError(message, 500, false);
  }
}
