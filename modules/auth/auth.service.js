import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma.js";
import ErrorResponse from "../../utils/errorResponse.js";
import asyncHandler from "../../middleware/async.js";

// Generate JWT
// const generateJwt = (userId) => {
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE,
//   });
// };

const generateJwt = (user) => {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
    header: {
      alg: "HS256",
      typ: "JWT",
      kid: "my-key-id",   // optional custom header field
    },
  });
};

// Help Create Session record
/**
 * @param {number} userId 
 * @param {string} token 
 * @param {string} [userAgent] 
 * @returns {Promise<import(".prisma/client").Session>}
 */
export const createSessionRecord = async (userId, token, userAgent = "Unknown") => {
  return prisma.session.create({
    data: {
      userId,
      token,
      userAgent
    }
  });
};

// Register user
export const registerUser = asyncHandler(
  async ({ name, email, phone, password, role, userAgent }) => {
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

    const token = generateJwt(user);
    await createSessionRecord(user.id, token, userAgent);

    return { user, confirmToken, token };
  },
);

// Login user
export const loginUser = asyncHandler(async ({ email, password, userAgent }) => {
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

  // --- Auto-Cleanup: Delete sessions older than 30 days (matching your JWT_EXPIRE) ---
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await prisma.session.deleteMany({
    where: {
      userId: user.id,
      createdAt: { lt: thirtyDaysAgo },
    },
  });

  // Check active sessions count (Exempt ADMIN and SUPERADMIN)
  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
    const sessionCount = await prisma.session.count({
      where: { userId: user.id },
    });

    if (sessionCount >= 2) {
      throw new ErrorResponse(
        "Reached maximum device limit. Logout from another device to login.",
        403,
      );
    }
  }

  const token = generateJwt(user);

  // Create new session
  await prisma.session.create({
    data: {
      userId: user.id,
      token: token,
      userAgent: userAgent || "Unknown",
    },
  });

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

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    const token = generateJwt(updatedUser);
    await createSessionRecord(updatedUser.id, token);
    return token;
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

  const jwtToken = generateJwt(user);
  await createSessionRecord(user.id, jwtToken);
  return jwtToken;
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

  const jwtToken = generateJwt(user);
  await createSessionRecord(user.id, jwtToken);
  return jwtToken;
});

// -- Admin Session Management --

/**
 * Get all active sessions for a specific user
 * @param {number} userId 
 */
export const getUserSessions = async (userId) => {
  return prisma.session.findMany({
    where: { userId: parseInt(userId) },
    select: {
      id: true,
      userAgent: true,
      token: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Get all active sessions (Paginated, optional email search)
 * @param {Object} options
 * @param {number} options.page
 * @param {number} options.limit
 * @param {string} [options.email]
 */
export const getAllSessions = async ({ page, limit, email }) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (email) {
    where.user = {
      email: { contains: email, mode: "insensitive" },
    };
  }

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.session.count({ where }),
  ]);

  return {
    sessions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Delete a specific session by ID
 * @param {string} sessionId 
 */
export const deleteSession = async (sessionId) => {
  return prisma.session.delete({
    where: { id: sessionId },
  });
};

/**
 * Logout a user from all devices
 * @param {number} userId 
 */
export const deleteAllUserSessions = async (userId) => {
  return prisma.session.deleteMany({
    where: { userId: parseInt(userId) },
  });
};

/**
 * Logout all sessions for a user except the current one
 * @param {number} userId 
 * @param {string} currentToken 
 */
export const logoutOtherDevices = async (userId, currentToken) => {
  return prisma.session.deleteMany({
    where: {
      userId: parseInt(userId),
      token: { not: currentToken },
    },
  });
};

/**
 * Logout - remove current session
 * @param {string} token 
 */
export const logoutService = async (token) => {
  return prisma.session.delete({
    where: { token },
  });
};
