import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${process.env.BASE_URL}/user/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      // Here, you'd usually look up or create the user in your DB
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails ? profile.emails[0].value : null,
        picture: profile.photos ? profile.photos[0].value : null,
      };

      return done(null, user); // send user to route
    }
  )
);

// Optional if using sessions (not required for JWT)
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user as any);
});
