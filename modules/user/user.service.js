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
  });
};

export const getUsers = () => {
  return prisma.user.findMany();
};

export const getUserById = (id) => {
  return prisma.user.findUnique({ where: { id } });
};

export const updateUser = (id, data) => {
  return prisma.user.update({ where: { id }, data });
};

export const deleteUser = (id) => {
  return prisma.user.delete({ where: { id } });
};

export const getUserByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } });
};
