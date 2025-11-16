import axios from "axios";
import config from "../config/config.js";
import type { Request, Response } from "express";
import { BadRequestError } from "../utils/erros.js";
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies.js";
import { PrismaClient } from "../generated/prisma/client.js";

const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_API = "https://api.github.com/user";

const prisma = new PrismaClient();

export const gitLogin = (req: Request, res: Response) => {
	const redirectUrlParams = new URLSearchParams({
		client_id: config.GITHUB_CLIENT_ID,
		redirect_uri: config.GITHUB_CALLBACK_URL,
		scope: "read:user user:email",
	});

	res.redirect(`${GITHUB_OAUTH_URL}?${redirectUrlParams.toString()}`);
};

export const handleGitCallback = async (req: Request, res: Response) => {
	const { code, error } = req.query as { code?: string; error?: string };

    // exchange code for token and fetch user details
	const githubUserData: {
		githubUser: any;
        accessToken: string;
		scope: string | null;
		email: string | null;
	} = await handleAccessTokenAndUserFetch(code!);

    const githubUser = githubUserData.githubUser;
    const scope = githubUserData.scope;
    const email = githubUserData.email;
    const accessToken = githubUserData.accessToken;

	// save user on database
	// write code to create user in database here
	const user = await prisma.user.upsert({
		where: {
			githubId: githubUser.id,
		},
		update: {
			username: githubUser.login,
			name: githubUser.name,
			email: email,
			avatarUrl: githubUser.avatar_url,
			bio: githubUser.bio,
			profileUrl: githubUser.html_url,

			githubToken: accessToken, // store encrypted if needed
			githubScope: scope,

			publicRepos: githubUser.public_repos,
			privateRepos: githubUser.total_private_repos,
			followers: githubUser.followers,
			following: githubUser.following,
		},
		create: {
			id: crypto.randomUUID(),
			githubId: githubUser.id,
			username: githubUser.login,
			name: githubUser.name,
			email: email,
			avatarUrl: githubUser.avatar_url,
			bio: githubUser.bio,
			profileUrl: githubUser.html_url,

			githubToken: accessToken,
			githubScope: scope,

			publicRepos: githubUser.public_repos,
			privateRepos: githubUser.total_private_repos,
			followers: githubUser.followers,
			following: githubUser.following,
		},
	});

	// generate jwt token payload
	const tokenPayload: {
		userId: string;
		githubId: string;
		username: string;
	} = {
		userId: user.id,
		githubId: githubUserData.githubUser.id,
		username: githubUserData.githubUser.login,
	};

    // generate jwt token
	generateTokenAndSetCookies(req, res, tokenPayload);

	res.json({
		msg: "done!",
	});
};

export const gitLogout = (req: Request, res: Response) => {
	res.clearCookie("accessToken", {
		httpOnly: true,
		secure: false,
		sameSite: "lax",
		path: "/",
	});

	res.clearCookie("refreshToken", {
		httpOnly: true,
		secure: false,
		sameSite: "lax",
		path: "/",
	});

	res.json({
		msg: "Logged Out!",
	});
};

const handleAccessTokenAndUserFetch = async (code: string) => {
	const accessTokenUrlParams = new URLSearchParams({
		client_id: config.GITHUB_CLIENT_ID,
		client_secret: config.GITHUB_CLIENT_SECRET,
		code,
		redirect_url: config.GITHUB_CALLBACK_URL,
	});

	const accessTokenUrl = `${GITHUB_TOKEN_URL}?${accessTokenUrlParams.toString()}`;

	const response = await axios.post(
		accessTokenUrl,
		{},
		{
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		}
	);

	const data = new URLSearchParams(response.data);

	const accessToken = data.get("access_token");

	// scope
	const scope = data.get("scope");

	if (!accessToken) throw new BadRequestError("Failed to retrive access token");

	const userResponse = await axios.get(GITHUB_USER_API, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	// githuhUser
	const githubUser = userResponse.data;

	const emailsResponse = await axios.get("https://api.github.com/user/emails", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const email = emailsResponse.data[0].email;

	return {
		githubUser,
        accessToken: accessToken,
		scope: scope ?? null,
		email: email ?? null,
	};
};
