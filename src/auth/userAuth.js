import passport from "passport";
import userModel from "../model/userModel.js";

passport.use(
  new LocalStrategy(function (username, password, done) {
    userModel.findOne({ username: username }),
      function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }
        if (!user.verifyPassword(password)) {
          return done(null, false);
        }

        // If the user is found and the password is correct
        return done(null, user);
      };
  })
);

// Then, in the user route, we can use the passport.authenticate() method to authenticate the user.
app.get("/admin", function (req, res) {
  if (req.user.role !== "admin") {
    return res.status(403).send("You are not authorized to access this page");
  }

  res.send(`Welcome, admin: ${req.user.username}!`);
});
