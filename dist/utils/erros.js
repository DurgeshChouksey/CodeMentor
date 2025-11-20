export class BadRequestError extends Error {
    statusCode;
    constructor(message = "Bad Request") {
        super(message);
        this.name = "BadRequestError";
        this.statusCode = 400;
    }
}
export class UnauthorizedError extends Error {
    statusCode;
    constructor(message = "Unauthorized Request") {
        super(message);
        this.name = "UnauthorizedError";
        this.statusCode = 401;
    }
}
export class NotFoundError extends Error {
    statusCode;
    constructor(message = "Not Found Error") {
        super(message);
        this.name = "NotFoundError";
        this.statusCode = 404;
    }
}
export class ForbiddenError extends Error {
    statusCode;
    constructor(message = "ForBidden Request") {
        super(message);
        this.name = "ForBiddenError";
        this.statusCode = 403;
    }
}
export class ConflictError extends Error {
    statusCode;
    constructor(message = "Conflict Error") {
        super(message);
        this.name = "ConflictError";
        this.statusCode = 409;
    }
}
export class TooManyRequestError extends Error {
    statusCode;
    constructor(message = "Too Many Request") {
        super(message);
        this.name = "ToManyRequestError";
        this.statusCode = 429;
    }
}
export class InternalServerError extends Error {
    statusCode;
    constructor(message = "Internal Server Error") {
        super(message);
        this.name = "InternalServerError";
        this.statusCode = 500;
    }
}
//# sourceMappingURL=erros.js.map