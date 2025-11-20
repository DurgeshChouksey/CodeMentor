import type { Request, Response } from "express";
export declare const generateTokenAndSetCookies: (req: Request, res: Response, tokenPayload: {
    userId: string;
    githubId: number;
    username: string;
}) => void;
//# sourceMappingURL=generateTokenAndSetCookies.d.ts.map