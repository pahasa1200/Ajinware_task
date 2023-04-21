import {  NextFunction, Request, Response } from "express";
import ApiError from "../utils/api-error";
import { ValidationError } from "express-validation";
import { messages } from "../utils/messages";
import { logger } from "../utils/logger";

export function errorMiddlware (error: ApiError | Error, req: Request, res: Response, next: NextFunction) {
    console.log(error);
    if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({ message: error.message, errors: error.details.body?.[0].message });
      }
    if (error instanceof ApiError) {
        logger.error(`${error.status || 500} - ${res.statusMessage} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        return res.status(error.status).json({ message: error.message, errors: error.errors });
    }
    logger.error(`500 - ${res.statusMessage} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    return res.status(500).json({ message: messages.errors.UNEXPECTED_ERROR });
}
