import JWT from "jsonwebtoken";

import AppError from "../utils/app-error";
import { httpStatusCode } from "../constants";
import * as UserServices from "../services/user.service";
import { catchAsync } from "../middlewares/catch-async.middleware";

const createToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await UserServices.getUsers();
  res.status(httpStatusCode.OK).json({
    users,
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await UserServices.getUserById(req.params.id);
  res.status(httpStatusCode.OK).json({
    user,
  });
});

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await UserServices.getUserByEmail(email);

  if (user) {
    next(new AppError("Email already exists.", httpStatusCode.BAD_REQUEST));
  }
  const newUser = await UserServices.createUser({
    email,
    name,
    password,
    confirmPassword,
  });
  res.status(httpStatusCode.OK).json({ user: newUser });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check email and password exists
  if (!email || !password) {
    next(
      new AppError(
        "Please provide email and password",
        httpStatusCode.BAD_REQUEST
      )
    );
  }
  // Check email and password correctly
  const user = await UserServices.getUserByEmail(email);
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(
      new AppError("Incorrect email or password", httpStatusCode.UNAUTHORIZED)
    );
  }
  // generate token
  const token = createToken(user._id);

  res.status(httpStatusCode.OK).json({
    token,
    data: {
      user,
    },
  });
});
