import AppError from "../utils/app-error";
import { httpStatusCode } from "../constants";

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = errors.join(". ");
  return new AppError(message, httpStatusCode.BAD_REQUEST);
};

const handleJWTTokenError = () =>
  new AppError(
    "Invalid token. Please login again",
    httpStatusCode.UNAUTHORIZED
  );

const handleTokenExpiredError = () =>
  new AppError("Token expired. Please login.", httpStatusCode.UNAUTHORIZED);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperation) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(httpStatusCode.INTERNAL_SERVER).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

export const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || httpStatusCode.INTERNAL_SERVER;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTTokenError();
    if (err.name === "TokenExpiredError") err = handleTokenExpiredError();
    sendErrorProd(err, res);
  }
};
