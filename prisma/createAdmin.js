import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const email = "admin@idealess.com";
  const password = "iDea#23&";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      isEmailConfirmed: true,
    },
    create: {
      name: "Admin",
      email,
      passwordHash,
      role: "ADMIN",
      isEmailConfirmed: true,
    },
  });

  console.log("✓ Admin user ready:", user.email, "| Role:", user.role, "| ID:", user.id);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error creating admin:", err);
  process.exit(1);
});
