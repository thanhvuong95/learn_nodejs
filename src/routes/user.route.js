import express from "express";
import { getAllUsers, getUser } from "../controllers/user.controller";

const router = express.Router();

router.route("/").get(getAllUsers);
router.route("/:id").get(getUser);

export default router;
