import prisma from "../../config/prisma.js";

export const createUser = (data) => {
  return prisma.user.create({ data });
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