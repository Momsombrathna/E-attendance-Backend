import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "286520904886-ntm51jp68q9o1u9qgeg2pk8tfk4ukh93.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3000/auth/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);
