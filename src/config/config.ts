import dotenv from 'dotenv'

dotenv.config();

interface Config {
    port : number;
    nodeEnv : string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GITHUB_CALLBACK_URL: string;
    JWT_TOKEN_SECRET: string;
    JWT_REFRESH_TOKEN_SECRET: string;
}

const config : Config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || '',
    JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET || '',
    JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET || '',
}

export default config;
