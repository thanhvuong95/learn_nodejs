import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

import { DB_URL } from "./configs/db.config";
import { PORT, MODE } from "./configs/app.config";

import { default as movieRoutes } from "./routes/movie.route";
import { default as userRoutes } from "./routes/user.route";
import { default as authRoutes } from "./routes/auth.route";

import { logger } from "./utils/logger";
import { globalError } from "./controllers/error.controller";
import AppError from "./utils/app-error";
import { httpStatusCode } from "./constants";

// process.on("uncaughtException", (err) => {
//   console.log("UNCAUGHT EXCEPTION: ", err.message);
//   process.exit(1);
// });

const isProduction = MODE === "production";

// create path log if it doesn't exist
const pathLog = path.join(__dirname, "log");
fs.existsSync(pathLog) || fs.mkdirSync(pathLog);

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

// error logger middleware
app.use(
  isProduction
    ? morgan("combined", {
        skip: (_, res) => res.statusCode < 400,
        stream: {
          write: (message) => {
            logger(pathLog, "error").error(message);
          },
        },
      })
    : morgan("dev")
);

// info logger middleware
app.use(
  isProduction
    ? morgan("combined", {
        skip: (_, res) => res.statusCode >= 400,
        stream: {
          write: (message) => {
            logger(pathLog, "info").info(message);
          },
        },
      })
    : morgan("dev")
);

app.use("/api", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't find route ${req.originalUrl}`,
      httpStatusCode.NOT_FOUND
    )
  );
});

app.use(globalError);

mongoose.set("strictQuery", false);
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successfully!");
  })
  .catch((e) => {
    console.log(e);
  });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// process.on("unhandledRejection", (err) => {
//   console.log("UNHANDLED REJECTION:", err.message);
//   process.exit(1);
// });
