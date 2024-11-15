const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const BookNow = require("./models/BookNow");
const ContactUs = require("./models/ContactUs");
const Venue = require("./models/Venue");
const OwnEvent = require("./models/OwnEvent");
const connectDB = require("./db");
require("dotenv").config();

const session = require("express-session"); // Add express-session

const passport = require("passport");
require("./config/passport"); // Import the Passport configuration

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // This is essential to allow cookies to be sent from frontend
  })
);
app.use(bodyParser.json());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET, // You should define a session secret in .env
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
const JWT_SECRET = process.env.JWT_SECRET;

connectDB();

// Signup route
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    user = new User({
      username,
      email,
      password,
    });

    await user.save();

    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Login route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    res.cookie("username", user.username, { httpOnly: true, maxAge: 3600000 });

    req.session.user = user;

    res.status(200).json({
      token,
      username: user.username,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// google auth

// Redirect the user to Google for authentication
app.get(
  "/api/auth/googlelogin",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google callback route
app.get(
  "/api/auth/google/callback",

  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, username: req.user.username, email: req.user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // res.status(200).json({
    //   token,
    //   username: req.user.username,
    //   message: "Google login successful",
    // });
    res.redirect(
      `http://localhost:3000/?token=${token}&username=${req.user.username}`
    );
  }
);

// Venue fetch route
app.get("/api/venues", async (req, res) => {
  try {
    const venues = await Venue.find();
    res.status(200).json(venues);
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Booking route
app.post("/api/bookings", async (req, res) => {
  const {
    name,
    email,
    date,
    time,
    eventType,
    subVenueType,
    message,
    paymentMethod,
  } = req.body;

  try {
    const booking = new BookNow({
      name,
      email,
      date,
      time,
      eventType,
      subVenueType,
      message,
      paymentMethod,
    });

    await booking.save();

    res.status(201).json({ message: "Booking successful!" });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Contact Us route
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const newMessage = new ContactUs({
      name,
      email,
      message,
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

const PORT = 5000;
console.log(PORT);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
