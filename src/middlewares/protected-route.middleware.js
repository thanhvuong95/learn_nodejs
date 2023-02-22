import JWT from "jsonwebtoken";
import { promisify } from "util";

import AppError from "../utils/app-error";
import { httpStatusCode } from "../constants";
import { catchAsync } from "./catch-async.middleware";
import * as UserService from "../services/user.service";

export const protectedRoute = catchAsync(async (req, res, next) => {
  // 1. check token validity
  // 2. check user was delete while use token
  // 3. check user changed password after use token
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(
      new AppError("You're not logged in."),
      httpStatusCode.UNAUTHORIZED
    );
  }
  const decodedToken = await promisify(JWT.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  const currentUser = await UserService.getUserById(decodedToken.id);

  // check if user is deleted while using token
  if (!currentUser) {
    return next(
      "The user belonging to this token does no long exist.",
      httpStatusCode.UNAUTHORIZED
    );
  }
  // user changed password after token was used
  if (currentUser.changedPassword(decodedToken.iat)) {
    return next(
      new AppError("User recently changed password."),
      httpStatusCode.UNAUTHORIZED
    );
  }
  // assign user to grant access to protected route
  req.user = currentUser;
  next();
});
