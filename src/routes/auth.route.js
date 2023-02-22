import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  updateMe,
} from "../controllers/auth.controller";
import { protectedRoute } from "../middlewares/protected-route.middleware";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").get(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/update-password").patch(protectedRoute, changePassword);
router.route("/update-me").patch(protectedRoute, updateMe);

export default router;
