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
  const { user, confirmToken } = await registerUser(req.body);

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
    jwt.sign({ id: user.id }, process.env.JWT_SECRET),
    201,
    res,
    "User registered successfully",
    user
  );
});

// @route POST /api/v1/auth/login
export const login = asyncHandler(async (req, res) => {
  const { user, token } = await loginUser(req.body);
  sendTokenResponse(token, 200, res, "Login successful", user);
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
