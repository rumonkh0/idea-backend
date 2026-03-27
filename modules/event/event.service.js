import prisma from "../../config/prisma.js";

// Create event (admin)
export const createEvent = async (data) => {
  return prisma.event.create({
    data,
  });
};

// Update event (admin)
export const updateEvent = async (id, data) => {
  return prisma.event.update({
    where: { id: parseInt(id) },
    data,
  });
};

// Delete event (admin)
export const deleteEvent = async (id) => {
  return prisma.event.delete({
    where: { id: parseInt(id) },
  });
};

// Get all events (admin)
export const getAllEvents = async () => {
  return prisma.event.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// Get single event by id (admin)
export const getEventById = async (id) => {
  return prisma.event.findUnique({
    where: { id: parseInt(id) },
  });
};

// Get all active events (user)
export const getActiveEvents = async () => {
  return prisma.event.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
};

// Get single active event by id (user)
export const getActiveEventById = async (id) => {
  return prisma.event.findFirst({
    where: { id: parseInt(id), active: true },
  });
};
