"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjects = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config/config");
const config_2 = require("../config");
const getProjects = async () => {
    const config = await (0, config_1.loadConfig)();
    const userId = config?.userId;
    const accessToken = config?.token;
    console.log("access token ", accessToken);
    if (!userId || !accessToken) {
        throw new Error("userId and accessToken are required");
    }
    const response = await axios_1.default.get(`${config_2.SERVER_URL}/projects`, {
        params: { userId, accessToken },
    });
    const projectsData = response.data.projects;
    if (!Array.isArray(projectsData)) {
        throw new Error("Invalid response format: projects is not an array");
    }
    return projectsData.map((project) => ({
        id: project.id,
        name: project.full_name,
    }));
};
exports.getProjects = getProjects;
