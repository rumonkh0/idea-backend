import prisma from "../../config/prisma.js";

// Create notice (admin)
export const createNotice = async (data) => {
  const payload = {
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
  };

  if (data.date) {
    payload.date = new Date(data.date);
  }
  if (data.category !== undefined) {
    payload.category = data.category;
  }
  if (data.isPinned !== undefined) {
    payload.isPinned =
      typeof data.isPinned === "boolean"
        ? data.isPinned
        : data.isPinned === "true";
  }

  return prisma.notice.create({
    data: payload,
  });
};

// Update notice (admin)
export const updateNotice = async (id, data) => {
  const payload = {};

  if (data.title !== undefined) payload.title = data.title;
  if (data.excerpt !== undefined) payload.excerpt = data.excerpt;
  if (data.content !== undefined) payload.content = data.content;
  if (data.date !== undefined) payload.date = new Date(data.date);
  if (data.category !== undefined) payload.category = data.category;
  if (data.isPinned !== undefined) {
    payload.isPinned =
      typeof data.isPinned === "boolean"
        ? data.isPinned
        : data.isPinned === "true";
  }

  return prisma.notice.update({
    where: { id },
    data: payload,
  });
};

// Delete notice (admin)
export const deleteNotice = async (id) => {
  return prisma.notice.delete({
    where: { id },
  });
};

// Get single notice by id
export const getNoticeById = async (id) => {
  return prisma.notice.findUnique({
    where: { id },
  });
};

// Get all notices with filtering, search, pagination, and sorting
export const getAllNotices = async (query = {}) => {
  const { category, isPinned, search, page, limit } = query;

  const where = {};

  // Filter by category
  if (category) {
    where.category = category;
  }

  // Filter by pinned status
  if (isPinned !== undefined) {
    where.isPinned =
      typeof isPinned === "boolean" ? isPinned : isPinned === "true";
  }

  // Search by title, excerpt, or content
  if (search && search.trim() !== "") {
    const searchTerm = search.trim();
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { excerpt: { contains: searchTerm, mode: "insensitive" } },
      { content: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const orderBy = [
    { isPinned: "desc" },
    { date: "desc" },
    { createdAt: "desc" },
  ];

  // Pagination support
  if (page && limit) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, notices] = await Promise.all([
      prisma.notice.count({ where }),
      prisma.notice.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
      }),
    ]);

    return {
      notices,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  const notices = await prisma.notice.findMany({
    where,
    orderBy,
  });

  return { notices, total: notices.length };
};
