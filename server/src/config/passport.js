import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config({path: './.env'});

// Initialize passport Google strategy only if credentials are provided
if (process.env.NODE_ENV !== 'test' && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;
          let user = await User.findOne({ $or: [{ googleId }, { email }] });
          if (!user) {
            user = await User.create({
              name: profile.displayName || email?.split('@')[0] || 'Google User',
              email,
              password: Math.random().toString(36).slice(2), // placeholder; user should reset password if needed
              googleId,
              avatar: profile.photos?.[0]?.value,
              isVerified: true,
            });
          } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  // Skip Google strategy when running tests or credentials are missing
  if (process.env.NODE_ENV === 'test') {
    console.log('Passport: skipping GoogleStrategy setup in test environment');
  } else {
    console.warn('Passport: GOOGLE_CLIENT_ID/SECRET not set; Google OAuth disabled');
  }
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('+email');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
