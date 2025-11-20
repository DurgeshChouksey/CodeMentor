import type { Request, Response, NextFunction } from "express";
// Extend Express Request to include user
declare module "express-serve-static-core" {
    interface Request {
        user?: {
            userId: string;
            githubId: number;
            username: string;
        };
    }
}
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../utils/erros.js";


export const authHandler = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { accessToken, refreshToken } = req.cookies;

	if (!accessToken) {
		if (!refreshToken) {
			throw new BadRequestError("Access and Refresh token not found!");
		}

		const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_TOKEN_SECRET);

		if (typeof decoded === "string") {
			throw new BadRequestError("Invalid or malformed token");
		}

		const payload = decoded as {
			userId: string;
			githubId: number;
			username: string;
		};

		req.user = payload;

		const newAccessToken = jwt.sign(
			{
				userId: payload.userId,
				githubId: payload.githubId,
				username: payload.username,
			},
			config.JWT_TOKEN_SECRET,
			{ expiresIn: "2h" }
		);

		res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            sameSite: "none",
			secure: true,
            maxAge: 2*60*60*1000,
            path: "/"
        });
	}

	const decoded = jwt.verify(accessToken, config.JWT_TOKEN_SECRET);

	if (!decoded) {
		console.log("failed access");
	}
	if (typeof decoded !== "string") {
	    req.user = decoded as {
	        userId: string;
	        githubId: number;
	        username: string;
	    };
	}
	next();
};
