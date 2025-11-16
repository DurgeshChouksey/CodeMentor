import type { Request, Response, NextFunction } from "express";
import config from "../config/config.js";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if(!err) {
        err.message = 'Internal Server Error';
        err.statusCode = 500;
        err.name = 'InternalServerError';
    }

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        name: err.name,
        msg: err.message,
        ...(config.nodeEnv === 'development' && {stack: err.stackTrace})
    })
}
