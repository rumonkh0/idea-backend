import express from "express";
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
import bkash from "./modules/payment/bkash.route.js";
import payments from "./modules/payment/payment.route.js";

// Initialize app
const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Set security headers
app.use(helmet());

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
app.use(express.static("public"));

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/courses", courses);
// bKash webhook (public)
app.use("/api/bkash", bkash);
// Payment routes
app.use("/api/v1/payments", payments);
app.get("/api/v1", async (req, res) => {
  //   res.send("Welcome to Idea learning!");
  const result = await pool.query("SELECT NOW()");
  res.json({ message: "Welcome to Idea learning!", Time: result.rows[0].now });
});

// Error handler middleware
app.use(errorHandler);

export default app;
