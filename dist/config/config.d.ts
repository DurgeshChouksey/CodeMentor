interface Config {
    port: number;
    nodeEnv: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GITHUB_CALLBACK_URL: string;
    JWT_TOKEN_SECRET: string;
    JWT_REFRESH_TOKEN_SECRET: string;
}
declare const config: Config;
export default config;
//# sourceMappingURL=config.d.ts.map