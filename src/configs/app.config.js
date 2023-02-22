import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const MODE = process.env.NODE_ENV;
// export default {
//   PORT: process.env.PORT || 3000,
//   MODE: process.env.NODE_ENV,
// };
//  => import APP_CONFIG from './configs/app.config';
