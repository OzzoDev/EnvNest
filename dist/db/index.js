"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbClient = exports.executeQuery = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const projects_1 = __importDefault(require("./projects"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const sanitizeValues = (values) => {
    return values.map((value) => {
        if (typeof value === "string") {
            return value.trim();
        }
        return value;
    });
};
const executeQuery = async (queryText, values = []) => {
    const sanitizedValues = sanitizeValues(values);
    const client = await pool.connect();
    try {
        const response = await client.query(queryText, sanitizedValues);
        return response.rows;
    }
    catch (err) {
        console.error("Database query error:", err);
        throw err;
    }
    finally {
        client.release();
    }
};
exports.executeQuery = executeQuery;
const getDbClient = async () => {
    return {
        projects: projects_1.default,
    };
};
exports.getDbClient = getDbClient;
