import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  plot: String,
  genres: Array,
  runtime: Number,
  cast: Array,
  num_mflix_comments: Number,
  title: String,
  fullplot: String,
  countries: Array,
  released: Date,
  directors: Array,
  rated: String,
  awards: Object,
  lastupdated: Date,
  year: Number,
  imdb: Object,
  type: String,
  tomatoes: Object,
});

movieSchema.index({ title: "text", plot: "text" });
const Movies = mongoose.model("Movies", movieSchema);

export default Movies;
