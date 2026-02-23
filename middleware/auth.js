import jwt from "jsonwebtoken";
import asyncHandler from "./async.js";
import ErrorResponse from "../utils/errorResponse.js";
import prisma from "../config/prisma.js";

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Cookie token (optional)
  else if (req.cookies?.token) {
    // console.log("Token found in cookies");
    token = req.cookies.token;
  }

  // console.log("Received token:", token);

  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded JWT:", decoded);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailConfirmed: true,
      },
    });

    if (!user) {
      return next(new ErrorResponse("User not found", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user?.role} is not authorized to access this route`,
          403,
        ),
      );
    }
    next();
  };
};
