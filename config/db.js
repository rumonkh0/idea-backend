import { Pool } from "pg";
import dotenv from "dotenv";
import colors from "colors";
dotenv.config({ path: "./config/config.env" });

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const connectDB = async () => {
  try {
    const conn = await pool.connect();
    console.log(
      `PostgreSQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT}`.cyan
        .underline.bold,
    );
    conn.release();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

pool.on("error", (err) => {
  console.error("Unexpected PG error", err);
  process.exit(1);
});

export { pool, connectDB };

// const mongoose = require('mongoose');

// const connectDB = async () => {
//   const conn = await mongoose.connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true
//   });

//   console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
// };

// module.exports = connectDB;
