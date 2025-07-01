"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateWithGithub = void 0;
const http_1 = __importDefault(require("http"));
const open_1 = __importDefault(require("open"));
const axios_1 = __importDefault(require("axios"));
const oauth_app_1 = require("@octokit/oauth-app");
const config_1 = require("../config/config");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const PORT = process.env.PORT;
const REDIRECT_URI = `http://localhost:${PORT}/api/auth/callback/github`;
if (!CLIENT_ID || !CLIENT_SECRET || !PORT) {
    throw new Error("Missing GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET or PORT in .env file");
}
const authenticateWithGithub = async () => {
    const app = new oauth_app_1.OAuthApp({
        clientType: "oauth-app",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
    });
    const { url } = app.getWebFlowAuthorizationUrl({
        scopes: ["read:user"],
        redirectUrl: REDIRECT_URI,
    });
    const code = await new Promise((resolve, reject) => {
        const server = http_1.default.createServer((req, res) => {
            if (!req.url) {
                res.end();
                return;
            }
            const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
            if (reqUrl.pathname === "/api/auth/callback/github") {
                const code = reqUrl.searchParams.get("code");
                if (code) {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(`
            <html>
              <head>
                <title>Authentication Successful</title>
                <style>
                  body {
                    background-color: #000;
                    color: #FFA500;
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    text-align: center;
                  }
                  h1 {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                  }
                  p {
                    font-size: 1.2rem;
                  }
                </style>
              </head>
              <body>
                <h1>Authentication successful!</h1>
                <p>You can close this tab now.</p>
              </body>
            </html>
          `);
                    server.close();
                    resolve(code);
                }
                else {
                    res.writeHead(400, { "Content-Type": "text/html" });
                    res.end(`
            <html>
              <head>
                <title>Authentication Error</title>
                <style>
                  body {
                    background-color: #000;
                    color: #FFA500;
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    text-align: center;
                  }
                  h1 {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                  }
                  p {
                    font-size: 1.2rem;
                  }
                </style>
              </head>
              <body>
                <h1>No code received.</h1>
                <p>Please try logging in again.</p>
              </body>
            </html>
          `);
                    reject(new Error("No code received"));
                    server.close();
                }
            }
            else {
                res.writeHead(404);
                res.end();
            }
        });
        server.listen(PORT, () => {
            console.log(`🔐 Opening GitHub login in your browser...`);
            (0, open_1.default)(url).catch(() => {
                console.log(`Failed to open browser. Please open manually:\n${url}`);
            });
        });
    });
    const { authentication } = await app.createToken({
        code,
        redirectUrl: REDIRECT_URI,
    });
    const userRes = await axios_1.default.get("https://api.github.com/user", {
        headers: {
            Authorization: `token ${authentication.token}`,
        },
    });
    const userId = String(userRes.data.id);
    const token = authentication.token;
    await (0, config_1.saveUserConfig)({ userId, token });
    return { userId, token };
};
exports.authenticateWithGithub = authenticateWithGithub;
