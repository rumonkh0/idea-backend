import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import colors from "colors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";
import errorHandler from "./middleware/error.js";
import { pool, connectDB } from "./config/db.js";

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Route files
import auth from "./modules/auth/auth.route.js";
import users from "./modules/user/user.route.js";
import courses from "./modules/course/course.route.js";
import blogs from "./modules/blog/blog.route.js";
import bkash from "./modules/payment/bkash.route.js";
import payments from "./modules/payment/payment.route.js";

// Initialize app
const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

console.log(`NODE_ENV: ${process.env.NODE_ENV}`.yellow.bold);

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Set security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Prevent XSS attacks
//   app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/courses", courses);
app.use("/api/v1/blogs", blogs);
// bKash webhook (public)
app.use("/api/v1/bkash", bkash);
// Payment routes
app.use("/api/v1/payments", payments);
app.get("/api/v1", async (req, res) => {
  const result = await pool.query("SELECT NOW()");

  const now = new Date(result.rows[0].now);

  const readableTime = now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  res.status(200).json({
    success: true,
    status: "active",
    code: 200,
    message: "✨ Welcome to Idea Learning — Empowering Intelligent Growth.",

    platform: {
      name: "Idea Learning",
      api_version: "v1",
      release: "stable",
    },

    server_time: {
      iso: now.toISOString(),
      readable: readableTime,
    },

    client: {
      protocol: req.protocol,
      secure: req.secure,
    },

    links: {
      documentation:
        "https://documenter.getpostman.com/view/51096995/2sBXijKCPZ",
    },
  });
});

// Error handler middleware
app.use(errorHandler);

export default app;
