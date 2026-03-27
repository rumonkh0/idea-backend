import prisma from "../../config/prisma.js";

// Create message (user)
export const createMessage = async (data) => {
  return prisma.message.create({
    data,
  });
};

// Get all messages (admin) with pagination
export const getMessages = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.message.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.message.count(),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// Get single message by id (admin)
export const getMessageById = async (id) => {
  return prisma.message.findUnique({
    where: { id: parseInt(id) },
  });
};

// Delete message (admin)
export const deleteMessage = async (id) => {
  return prisma.message.delete({
    where: { id: parseInt(id) },
  });
};
