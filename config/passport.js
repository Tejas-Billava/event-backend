const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://event-backend-q46x.onrender.com/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user); // User exists, return the user
        } else {
          // Create a new user
          user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
          });

          await user.save(); // Save the new user
          return done(null, user);
        }
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error, false);
      }
    }
  )
);

// Serialize user for sessions
passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize the user ID
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // Deserialize the user by ID
  } catch (err) {
    done(err, null); // If an error occurs, pass it to done
  }
});
