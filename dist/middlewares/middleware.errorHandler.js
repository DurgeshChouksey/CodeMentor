import config from "../config/config.js";
export const errorHandler = (err, req, res, next) => {
    if (!err) {
        err.message = 'Internal Server Error';
        err.statusCode = 500;
        err.name = 'InternalServerError';
    }
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        name: err.name,
        msg: err.message,
        ...(config.nodeEnv === 'development' && { stack: err.stackTrace })
    });
};
//# sourceMappingURL=middleware.errorHandler.js.map