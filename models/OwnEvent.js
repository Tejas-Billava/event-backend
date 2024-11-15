// models/OwnEvent.js

const mongoose = require("mongoose");

const ownEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  hour: { type: String, required: true },
  minute: { type: String, required: true },
  duration: { type: String },
  location: { type: String, required: true },
  files: [{ type: String }], // Store file paths or URLs if needed
  notify: { type: String, enum: ["slack", "email"], default: "slack" },
});

const OwnEvent = mongoose.model("OwnEvent", ownEventSchema);

module.exports = OwnEvent;
