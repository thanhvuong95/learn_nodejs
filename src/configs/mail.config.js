import dotenv from "dotenv";

dotenv.config();

export const HOST_NAME = process.env.MAIL_HOST;
export const PORT = process.env.MAIL_PORT;
export const USERNAME = process.env.MAIL_USERNAME;
export const PASSWORD = process.env.MAIL_PASSWORD;
export const FROM_EMAIL = process.env.MAIL_FROM_EMAIL;
