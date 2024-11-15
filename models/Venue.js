const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: [String], // Array of descriptions for the different packages
  image: { type: String, required: true }, // URL or file path for the image
});

module.exports = mongoose.model("Venue", venueSchema);
