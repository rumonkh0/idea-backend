import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma.js";
import ErrorResponse from "../../utils/errorResponse.js";
import asyncHandler from "../../middleware/async.js";

// Generate JWT
const generateJwt = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register user
export const registerUser = asyncHandler(
  async ({ name, email, password, role }) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // Industry standard rounds

    // Generate a raw token to send to the user's email
    const confirmToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing it (security best practice)
    const hashedToken = crypto
      .createHash("sha256")
      .update(confirmToken)
      .digest("hex");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role,
        confirmEmailToken: hashedToken, // Storing the hashed version
      },
    });

    // Return the raw confirmToken to be sent in the email link
    return { user, confirmToken };
  },
);

// Login user
export const loginUser = asyncHandler(async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ErrorResponse("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new ErrorResponse("Invalid credentials", 401);
  }

  const token = generateJwt(user.id);
  return { user, token };
});

// Update password
export const updatePasswordService = asyncHandler(
  async (userId, currentPassword, newPassword) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      throw new ErrorResponse("Password is incorrect", 401);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return generateJwt(userId);
  },
);

// Update user details
export const updateDetailsService = asyncHandler(async (userId, data) => {
  const allowedFields = {
    name: data.name,
    email: data.email,
  };

  return prisma.user.update({
    where: { id: userId },
    data: allowedFields,
  });
});

// Forgot password
export const forgotPasswordService = asyncHandler(async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ErrorResponse("There is no user with that email", 404);
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return { user, resetToken };
});

// Reset password
export const resetPasswordService = asyncHandler(async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ErrorResponse("Invalid token", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    },
  });

  return generateJwt(user.id);
});

// Confirm email
export const confirmEmailService = asyncHandler(async (token) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      confirmEmailToken: hashedToken,
      isEmailConfirmed: false,
    },
  });

  if (!user) {
    throw new ErrorResponse("Invalid token", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailConfirmed: true,
      confirmEmailToken: null,
    },
  });

  return generateJwt(user.id);
});
