"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const axios_1 = __importStar(require("axios"));
const open_1 = __importDefault(require("open"));
const readline_1 = __importDefault(require("readline"));
const config_1 = require("../config");
const config_2 = require("../config/config");
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
                const response = await axios_1.default.get(`${config_1.TOKEN_URL}?key=${encodeURIComponent(accessKey)}`);
                const session = response.data.session;
                if (session) {
                    authenticated = true;
                    user = { token: session.accessToken, userId: session.user.id };
                    await (0, config_2.saveConfig)({ userId: user.userId, token: user.token });
                    break;
                }
            }
            catch (err) {
                if (axios_1.default.isAxiosError(err)) {
                    if (attempts % 10 === 0) {
                        console.error(`Polling error (attempt ${attempts}): ${err.message}`);
                    }
                }
            }
        }
        if (!authenticated) {
            console.log("Authentication timed out.");
            return null;
        }
        return user;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            console.error("Authentication failed:", err.message);
        }
        return null;
    }
};
exports.authenticate = authenticate;
