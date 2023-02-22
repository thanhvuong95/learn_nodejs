import JWT from "jsonwebtoken";
import crypto from "crypto";

import AppError from "../utils/app-error";
import { sendMail } from "../utils/mailer";
import { httpStatusCode } from "../constants";
import { SECRET_KEY, EXPIRATION } from "../configs/auth.config";
import { catchAsync } from "../middlewares/catch-async.middleware";
import {
  createUser,
  getResetToken,
  getUserByEmail,
  getUserById,
  updateUser,
} from "../services/user.service";

const singedToken = (id) => {
  return JWT.sign({ id }, SECRET_KEY, {
    expiresIn: EXPIRATION,
  });
};

// 1. Register
export const register = catchAsync(async (req, res, next) => {
  // get email, name, password, confirm password
  const { email, name, password, confirmPassword } = req.body;
  if (!email || !name || !password || !confirmPassword) {
    return next(
      new AppError("Please provide information", httpStatusCode.BAD_REQUEST)
    );
  }
  // check if email exists
  const currentUser = await getUserByEmail(email);
  if (currentUser) {
    return next(
      new AppError("Email already exists", httpStatusCode.BAD_REQUEST)
    );
  }

  // register user
  const user = await createUser({ name, email, password, confirmPassword });
  res.status(httpStatusCode.OK).json({ user });
});

// 2. Login
export const login = catchAsync(async (req, res, next) => {
  // get email & password
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new AppError("Please entered information.", httpStatusCode.BAD_REQUEST)
    );
  }
  // check if email exists  -> check password match
  const user = await getUserByEmail(email, true);
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(
      new AppError("Email or password mismatch", httpStatusCode.BAD_REQUEST)
    );
  }
  // generate token
  const token = singedToken(user._id);
  res.status(httpStatusCode.OK).json({
    token,
  });
});
// 3.forgot password
export const forgotPassword = catchAsync(async (req, res, next) => {
  // check email address exists

  const user = await getUserByEmail(req.body.email);
  if (!user) {
    return next(
      new AppError(
        "There is no user with email address.",
        httpStatusCode.BAD_REQUEST
      )
    );
  }
  // send link change password to email
  const resetToken = user.createResetToken();
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/reset-password/${resetToken}
  `;
  await user.save({ validateBeforeSave: false });

  try {
    await sendMail({
      to: user.email,
      subject: "Reset password",
      payload: {
        name: user.name,
        link: resetURL,
      },
      htmlTemplate: "../views/email.handlebars",
    });
    res.status(httpStatusCode.OK).json({
      status: "success",
      message: "Please check email to get link reset password!",
    });
  } catch (e) {
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save({ validateBeforeSave: false });
    next(
      new AppError(
        "There was an error sending the email. Try again later.",
        httpStatusCode.BAD_REQUEST
      )
    );
  }
});
// 4. reset password
export const resetPassword = catchAsync(async (req, res, next) => {
  // create hash with token use crypto
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  //  find user with hashed token + expiration token valid(token & expiration > date.now())
  const user = await getResetToken(hashedToken);
  // if has user -> update password
  if (!user) {
    return next(
      new AppError("Token not found or expired", httpStatusCode.NOT_FOUND)
    );
  }

  // after user submit form reset password includes (new password, confirm new password)
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  // remove reset token in DB
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();
  res.status(httpStatusCode.OK).json({
    status: "success",
    message: "Password has been changed successfully.",
  });
});
// 5. change password

export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  // req.user.email from middleware protected or provide id through URL /update-password/:id
  // get user from collection.
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(
      new AppError("Please provide information.", httpStatusCode.BAD_REQUEST)
    );
  }

  if (currentPassword === newPassword) {
    return next(
      new AppError(
        "New password must be different from current password.",
        httpStatusCode.BAD_REQUEST
      )
    );
  }

  const user = await getUserById(req.user.id, true);
  if (!(await user.comparePassword(currentPassword, user.password))) {
    return next(
      new AppError(
        "Your current password is incorrect.",
        httpStatusCode.BAD_REQUEST
      )
    );
  }
  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();
  res.status(httpStatusCode.OK).json({
    status: "success",
    message: "Your password was successfully changed.",
  });
});
// 6. Update info without password
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
};
export const updateMe = catchAsync(async (req, res, next) => {
  // Can't change email address
  if (req.body.email) {
    return next(new AppError("Email can't change", httpStatusCode.BAD_REQUEST));
  }
  //  Can't change password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "This route is not for password update.",
        httpStatusCode.BAD_REQUEST
      )
    );
  }
  // filter unwanted fields not allowed update
  const filteredBody = filterObj(req.body, "name");
  if (!Object.keys(filteredBody).length) {
    return next(
      new AppError(
        "Please provide information about user.",
        httpStatusCode.BAD_REQUEST
      )
    );
  }
  const updatedUser = await updateUser(req.user.id, filteredBody);
  res.status(httpStatusCode.OK).json({
    status: "success",
    user: updatedUser,
  });
});
