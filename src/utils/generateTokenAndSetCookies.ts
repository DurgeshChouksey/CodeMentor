import config from '../config/config.js'
import jwt from "jsonwebtoken";
import type { Request, Response } from "express"

export const generateTokenAndSetCookies = (req: Request, res: Response, tokenPayload: {
    userId: string,
    githubId: number,
    username: string
}) => {

    const jwtAccessToken = jwt.sign(tokenPayload, config.JWT_TOKEN_SECRET, {
        expiresIn: '2h'
    })

    const jwtRefreshToken = jwt.sign(tokenPayload, config.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    })

    const isProduction = process.env.NODE_ENV === "production";

    console.log(isProduction);


    res.cookie("accessToken", jwtAccessToken, {
        httpOnly: true,
        secure: isProduction,               // true on Cloud Run, false on localhost
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 2 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", jwtRefreshToken, {
        httpOnly: true,
        secure: isProduction,               // true on Cloud Run, false on localhost
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
