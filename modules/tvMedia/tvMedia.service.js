import prisma from "../../config/prisma.js";

// Create TV media report (admin)
export const createTvMediaReport = async (data) => {
  return prisma.tvMediaReport.create({
    data: {
      channel: data.channel,
      topic: data.topic,
      link: data.link,
      platform: data.platform || "YouTube",
      isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
    },
  });
};

// Update TV media report (admin)
export const updateTvMediaReport = async (id, data) => {
  const updateData = {};
  if (data.channel !== undefined) updateData.channel = data.channel;
  if (data.topic !== undefined) updateData.topic = data.topic;
  if (data.link !== undefined) updateData.link = data.link;
  if (data.platform !== undefined) updateData.platform = data.platform;
  if (data.isAvailable !== undefined) updateData.isAvailable = Boolean(data.isAvailable);

  return prisma.tvMediaReport.update({
    where: { id: parseInt(id) },
    data: updateData,
  });
};

// Delete TV media report (admin)
export const deleteTvMediaReport = async (id) => {
  return prisma.tvMediaReport.delete({
    where: { id: parseInt(id) },
  });
};

// Get all TV media reports (admin)
export const getAllTvMediaReports = async (query = {}) => {
  const { limit, page } = query;
  if (page && limit) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    const [reports, total] = await Promise.all([
      prisma.tvMediaReport.findMany({
        orderBy: { id: "asc" },
        take,
        skip,
      }),
      prisma.tvMediaReport.count(),
    ]);
    return {
      reports,
      total,
      page: parseInt(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  const reports = await prisma.tvMediaReport.findMany({
    orderBy: { id: "asc" },
  });
  return { reports };
};

// Get available TV media reports (public)
export const getAvailableTvMediaReports = async (query = {}) => {
  const { limit, page } = query;
  const where = { isAvailable: true };

  if (page && limit) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    const [reports, total] = await Promise.all([
      prisma.tvMediaReport.findMany({
        where,
        orderBy: { id: "asc" },
        take,
        skip,
      }),
      prisma.tvMediaReport.count({ where }),
    ]);
    return {
      reports,
      total,
      page: parseInt(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  const reports = await prisma.tvMediaReport.findMany({
    where,
    orderBy: { id: "asc" },
  });
  return { reports };
};

// Get single TV media report by id
export const getTvMediaReportById = async (id) => {
  return prisma.tvMediaReport.findUnique({
    where: { id: parseInt(id) },
  });
};
