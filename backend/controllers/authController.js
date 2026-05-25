export {
  disabledGoogleOAuthController as googleOAuthCallback,
  disabledGoogleOAuthController as googleOAuthFailure,
  forgotPasswordController as forgotPasswordRequest,
  getAuthConfigController as getAuthConfig,
  getMeController as getMe,
  loginController as loginUser,
  logoutController as logoutUser,
  refreshController as refreshUserSession,
  resetPasswordController as resetPasswordRequest,
  signupController as signupUser,
  verifyEmailController as verifyEmailRequest,
} from "../src/controllers/auth.controller.js";
