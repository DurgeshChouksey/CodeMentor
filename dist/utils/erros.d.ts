export declare class BadRequestError extends Error {
    statusCode: number;
    constructor(message?: string);
}
export declare class UnauthorizedError extends Error {
    statusCode: number;
    constructor(message?: string);
}
export declare class NotFoundError extends Error {
    statusCode: number;
    constructor(message?: string);
}
export declare class ForbiddenError extends Error {
    statusCode: number;
    constructor(message?: string);
}
export declare class ConflictError extends Error {
    statusCode: number;
    constructor(message?: string);
}
export declare class TooManyRequestError extends Error {
    statusCode: number;
    constructor(message?: string);
}
export declare class InternalServerError extends Error {
    statusCode: number;
    constructor(message?: string);
}
//# sourceMappingURL=erros.d.ts.map