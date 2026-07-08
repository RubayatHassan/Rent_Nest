import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";
import { AppError } from "../errors/AppError";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || "Internal Server Error";
  const errorName = err.name || "Internal Server Error";
  const isProduction = config.node_env === "production";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      errorMessage = "Record not found.";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      errorMessage = "Authentication failed against database server. Please check your credentials.";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Can't reach database server.";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "Error occurred during query execution.";
  } else if (!err.statusCode && isProduction) {
    errorMessage = "Internal Server Error";
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    name: errorName,
    message: errorMessage,
    ...(isProduction ? {} : { error: err.stack })
  });
};