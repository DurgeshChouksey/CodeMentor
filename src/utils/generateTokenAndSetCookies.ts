import config from '../config/config.js'
import jwt from "jsonwebtoken";
import type { Request, Response } from "express"

export const generateTokenAndSetCookies = (req: Request, res: Response, tokenPayload: {
    userId: string,
    githubId: string,
    username: string
}) => {

    const jwtAccessToken = jwt.sign(tokenPayload, config.JWT_TOKEN_SECRET, {
        expiresIn: '2h'
    })

    const jwtRefreshToken = jwt.sign(tokenPayload, config.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    })

    res.cookie('accessToken', jwtAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 2*60*60*1000
    })

    res.cookie('refreshToken', jwtRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 7*24*60*60*1000
    })
}
