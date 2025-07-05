"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateWithGithub = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("../config/config");
dotenv_1.default.config();
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
if (!CLIENT_ID)
    throw new Error("Missing GITHUB_CLIENT_ID in .env");
const authenticateWithGithub = async () => {
    try {
        const { data } = await axios_1.default.post("https://github.com/login/device/code", new URLSearchParams({
            client_id: CLIENT_ID,
            scope: "read:user",
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
        });
        console.log(`\n🔗 Visit: ${data.verification_uri}`);
        console.log(`📝 Enter code: ${data.user_code}\n`);
        const pollInterval = data.interval * 1000;
        const expiresIn = data.expires_in;
        const maxAttempts = Math.ceil(expiresIn / data.interval);
        let attempts = 0;
        let token = null;
        while (!token && attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, pollInterval));
            attempts++;
            try {
                const res = await axios_1.default.post("https://github.com/login/oauth/access_token", new URLSearchParams({
                    client_id: CLIENT_ID,
                    device_code: data.device_code,
                    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                }), {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Accept: "application/json",
                    },
                });
                if (res.data.access_token) {
                    token = res.data.access_token;
                }
                else if (res.data.error &&
                    res.data.error !== "authorization_pending") {
                    throw new Error(`GitHub error: ${res.data.error_description}`);
                }
            }
            catch { }
        }
        if (!token) {
            throw new Error("Authentication timed out or failed.");
        }
        const userRes = await axios_1.default.get("https://api.github.com/user", {
            headers: { Authorization: `token ${token}` },
        });
        const userId = String(userRes.data.id);
        await (0, config_1.saveConfig)({ userId, token });
        return { userId, token };
    }
    catch {
        return null;
    }
};
exports.authenticateWithGithub = authenticateWithGithub;
