import dotenv from "dotenv";

dotenv.config();

export const SECRET_KEY = process.env.JWT_SECRET_KEY;
export const EXPIRATION = process.env.JWT_EXPIRATION;
