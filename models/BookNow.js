const mongoose = require("mongoose");

const bookNowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  eventType: { type: String, required: true },
  subVenueType: { type: String, required: true },
  message: { type: String, default: "" },
  paymentMethod: { type: String, required: true },
});

module.exports = mongoose.model("BookNow", bookNowSchema);
