import asyncHandler from "../../middleware/async.js";
import jwt from "jsonwebtoken";
import sendEmail from "../../utils/sendEmail.js";
import {
  registerUser,
  loginUser,
  forgotPasswordService,
  resetPasswordService,
  confirmEmailService,
  updateDetailsService,
  updatePasswordService,
  getUserSessions,
  getAllSessions,
  deleteSession,
  deleteAllUserSessions,
  logoutOtherDevices,
  logoutService,
} from "./auth.service.js";

// Cookie + response helper
const sendTokenResponse = (
  token,
  statusCode,
  res,
  message = "Successfully authenticated",
  user
) => {
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  // pick only safe fields
  const safeUser = {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      message,
      token,
      user: safeUser,
    });
};

// @route POST /api/v1/auth/register
export const register = asyncHandler(async (req, res) => {
  const { user, confirmToken, token } = await registerUser({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const confirmURL = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/auth/confirmemail?token=${confirmToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Confirm your email",
      message: `Please confirm your email: \n\n${confirmURL}`,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
  }

  sendTokenResponse(
    token,
    201,
    res,
    "User registered successfully",
    user
  );
});

// @route POST /api/v1/auth/login
export const login = asyncHandler(async (req, res) => {
  const { user, token } = await loginUser({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
  sendTokenResponse(token, 200, res, "Login successful", user);
});

// @route POST /api/v1/auth/logout
export const logout = asyncHandler(async (req, res) => {
  // Delete current session from DB via service
  await logoutService(req.token);

  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Logout all sessions except current one
// @route   POST /api/v1/auth/logout-others
// @access  Private
export const logoutOthers = asyncHandler(async (req, res, next) => {
  await logoutOtherDevices(req.user.id, req.token);

  res.status(200).json({
    success: true,
    message: "Logged out from all other devices successfully",
    data: {},
  });
});

// @route PUT /api/v1/auth/updatedetails
export const updateDetails = asyncHandler(async (req, res) => {
  const user = await updateDetailsService(req.user.id, req.body);
  res.status(200).json({
    success: true,
    message: "User details updated successfully",
    data: user,
  });
});

// @route PUT /api/v1/auth/updatepassword
export const updatePassword = asyncHandler(async (req, res) => {
  const token = await updatePasswordService(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword,
  );
  sendTokenResponse(token, 200, res, "Password updated successfuly");
});

// @route POST /api/v1/auth/forgotpassword
export const forgotPassword = asyncHandler(async (req, res) => {
  const { user, resetToken } = await forgotPasswordService(req.body.email);

  const resetURL = `${req.protocol}://${req.get(
    "host",
  )}/api/v1/auth/resetpassword/${resetToken}`;

  await sendEmail({
    email: user.email,
    subject: "Password reset",
    message: `Reset your password: \n\n${resetURL}`,
  });

  res.status(200).json({
    success: true,
    message: "Password reset email sent successfully",
    data: null,
  });
});

// @route PUT /api/v1/auth/resetpassword/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const token = await resetPasswordService(req.params.token, req.body.password);

  sendTokenResponse(token, 200, res, "Password reset successful");
});

// @route GET /api/v1/auth/confirmemail
export const confirmEmail = asyncHandler(async (req, res) => {
  const token = await confirmEmailService(req.query.token);
  sendTokenResponse(token, 200, res, "Email confirmed successfully");
});

// -- Admin Session Controllers --

// @desc    Get all active sessions for a user
// @route   GET /api/v1/auth/admin/sessions/:userId
// @access  Private/Admin
export const adminGetUserSessions = asyncHandler(async (req, res, next) => {
  const sessions = await getUserSessions(req.params.userId);
  res.status(200).json({
    success: true,
    count: sessions.length,
    data: sessions,
  });
});

// @desc    Get all active sessions across all users (Paginated)
// @route   GET /api/v1/auth/admin/sessions
// @access  Private/Admin
export const adminGetAllSessions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const email = req.query.email;

  const result = await getAllSessions({ page, limit, email });

  res.status(200).json({
    success: true,
    ...result,
  });
});

// @desc    Delete a specific session
// @route   DELETE /api/v1/auth/admin/sessions/:sessionId
// @access  Private/Admin
export const adminDeleteSession = asyncHandler(async (req, res, next) => {
  await deleteSession(req.params.sessionId);
  res.status(200).json({
    success: true,
    message: "Session deleted successfully",
    data: null,
  });
});

// @desc    Logout a user from all devices
// @route   DELETE /api/v1/auth/admin/sessions/user/:userId
// @access  Private/Admin
export const adminLogoutAllDevices = asyncHandler(async (req, res, next) => {
  await deleteAllUserSessions(req.params.userId);
  res.status(200).json({
    success: true,
    message: "User logged out from all devices",
    data: null,
  });
});
