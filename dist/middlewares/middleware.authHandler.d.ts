import type { Request, Response, NextFunction } from "express";
declare module "express-serve-static-core" {
    interface Request {
        user?: {
            userId: string;
            githubId: number;
            username: string;
        };
    }
}
export declare const authHandler: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=middleware.authHandler.d.ts.map