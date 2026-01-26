import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Pass the adapter (not the pool) to the client
const prisma = new PrismaClient({ adapter });

export default prisma;
