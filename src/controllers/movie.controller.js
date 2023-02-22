import AppError from "../utils/app-error";
import { httpStatusCode } from "../constants";
import * as MovieServices from "../services/movie.service";
import { catchAsync } from "../middlewares/catch-async.middleware";

export const getAllMovie = catchAsync(async (req, res, next) => {
  const movies = await MovieServices.getAllMovie(req.query);
  res.status(httpStatusCode.OK).json({
    total: movies.length,
    movies,
  });
});

export const getMovie = catchAsync(async (req, res, next) => {
  const movies = await MovieServices.getMovieById(req.params.id);
  if (!movies) {
    next(
      new AppError(
        `Can't find movie with id ${req.params.id}`,
        httpStatusCode.NOT_FOUND
      )
    );
  }
  res.status(httpStatusCode.OK).json({
    total: movies.length,
    movies,
  });
});

export const deleteMovie = catchAsync(async (req, res, next) => {
  const movies = await MovieServices.deleteMovie(req.params.id);
  res.status(httpStatusCode.OK).json({
    total: movies.length,
    movies,
  });
});
