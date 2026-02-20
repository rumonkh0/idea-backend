import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";

export const createUser = async (data) => {
  const { name, email, phone, password, role } = data;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      role,
    },
    omit: {
      passwordHash: true,
    },
  });
};

export const getUsers = () => {
  return prisma.user.findMany();
};

export const getUserById = (id) => {
  return prisma.user.findUnique({ where: { id } });
};

export const updateUser = async (id, data) => {
  const updateData = { ...data };

  // If password is provided, hash it
  if (updateData.password) {
    const hashedPassword = await bcrypt.hash(updateData.password, 10);
    updateData.passwordHash = hashedPassword;
    delete updateData.password; // remove plain password
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    omit: {
      passwordHash: true,
    },
  });
};
export const deleteUser = (id) => {
  return prisma.user.delete({ where: { id } });
};

export const getUserByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } });
};
