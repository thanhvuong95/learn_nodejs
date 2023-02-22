import express from "express";
import {
  deleteMovie,
  getAllMovie,
  getMovie,
} from "../controllers/movie.controller";

const router = express.Router();

router.route("/").get(getAllMovie);
router.route("/:id").get(getMovie).delete(deleteMovie);

export default router;
