"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const axios_1 = __importDefault(require("axios"));
const open_1 = __importDefault(require("open"));
const readline_1 = __importDefault(require("readline"));
const config_1 = require("../config");
const POLL_INTERVAL = 500;
const prompt = (query) => {
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => rl.question(query, (ans) => {
        rl.close();
        resolve(ans.trim());
    }));
};
const authenticate = async () => {
    try {
        await (0, open_1.default)(config_1.START_URL);
        console.log(`\nPlease complete login in your browser.`);
        const accessKey = await prompt("Paste the access key here: ");
        let authenticated = false;
        let user = null;
        const maxAttempts = 60;
        let attempts = 0;
        while (!authenticated && attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, POLL_INTERVAL));
            attempts++;
            try {
                const response = await axios_1.default.get(`${config_1.TOKEN_URL}?key=${accessKey}`);
                const session = response.data.session;
                if (session) {
                    authenticated = true;
                    user = { token: session.access_token, userId: session.user.id };
                    break;
                }
            }
            catch { }
        }
        if (!authenticated) {
            console.log("Authentication timed out.");
            return null;
        }
        return user;
    }
    catch (err) {
        console.error("Authentication failed:", err);
        return null;
    }
};
exports.authenticate = authenticate;
