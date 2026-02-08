import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { Pool } from "pg";
dotenv.config({ path: "./config/config.env" });

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
    family: 4,
});

// const adapter = new PrismaPg({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,   
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
// });
const adapter = new PrismaPg(pool);


// Pass the adapter (not the pool) to the client
const prisma = new PrismaClient({ adapter });

export default prisma;
