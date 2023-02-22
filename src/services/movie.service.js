import Movies from "../models/movie.model";
import APIFeatures from "../utils/api-feature";

export const getAllMovie = async (query) => {
  const features = new APIFeatures(Movies.find(), query)
    .filter()
    .sort()
    .paginate();
  return await features.query;
};

export const getMovieById = async (id) => {
  return await Movies.findById(id);
};

export const deleteMovie = async (id) => {
  return await Movies.findByIdAndDelete(id);
};
