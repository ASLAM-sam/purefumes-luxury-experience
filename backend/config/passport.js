import passport from "passport";
import googleOAuth from "passport-google-oauth20";
import env, { getMissingGoogleOAuthConfigKeys } from "./env.js";
import logger from "./logger.js";

const { Strategy: GoogleStrategy } = googleOAuth;

export const isGoogleOAuthConfigured = () =>
  Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL);

export const getGoogleOAuthConfigStatus = () => ({
  enabled: isGoogleOAuthConfigured(),
  missing: getMissingGoogleOAuthConfigKeys(),
  callbackUrl: env.GOOGLE_CALLBACK_URL,
  backendUrl: env.BACKEND_URL,
  frontendUrl: env.FRONTEND_URL,
});

export const configurePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  if (!isGoogleOAuthConfigured()) {
    logger.warn("Google OAuth is not configured; /auth/google is disabled");
    return passport;
  }

  if (passport._strategy("google")) {
    return passport;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      (req, _accessToken, _refreshToken, profile, done) => {
        const email = profile.emails?.[0]?.value?.toLowerCase() || "";
        const profileImage = profile.photos?.[0]?.value || "";
        const normalizedProfile = {
          googleId: profile.id,
          email,
          name: profile.displayName || email.split("@")[0] || "Purefumes Customer",
          profileImage,
        };

        logger.info("Google profile received", {
          requestId: req.id,
          googleId: normalizedProfile.googleId,
          email: normalizedProfile.email,
          hasProfileImage: Boolean(normalizedProfile.profileImage),
        });

        done(null, normalizedProfile);
      },
    ),
  );

  return passport;
};

export default passport;
