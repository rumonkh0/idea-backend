import prisma from "../../config/prisma.js";
import fs from "fs";
import path from "path";

const getMediaType = (mimeType) => {
  if (!mimeType) return "IMAGE";
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "FILE";
};

const deleteFileIfExists = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
};

const deleteMediaFile = async (media) => {
  if (!media?.url) return;
  const publicRoot = path.join(process.cwd(), "public");
  await deleteFileIfExists(path.join(publicRoot, media.url));
};

export const createMediaFromFile = async (file) => {
  const url = `/uploads/newspaper/${file.filename}`;
  return prisma.media.create({
    data: {
      url,
      type: getMediaType(file.mimetype),
      provider: "local",
      alt: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    },
  });
};

export const createMediaFromUrl = async (url, alt = "Newspaper Clip Image") => {
  return prisma.media.create({
    data: {
      url,
      type: "IMAGE",
      provider: "local",
      alt,
    },
  });
};

// Create Newspaper Clip (admin)
export const createNewspaperClip = async (data) => {
  const { imageId, ...rest } = data;
  return prisma.newspaperClip.create({
    data: {
      ...rest,
      isAvailable: rest.isAvailable !== undefined ? Boolean(rest.isAvailable) : true,
      ...(imageId ? { image: { connect: { id: imageId } } } : {}),
    },
    include: { image: true },
  });
};

// Update Newspaper Clip (admin)
export const updateNewspaperClip = async (id, data) => {
  const { imageId, ...rest } = data;
  const numId = parseInt(id);

  if (imageId) {
    const existing = await prisma.newspaperClip.findUnique({
      where: { id: numId },
      include: { image: true },
    });

    if (existing?.image) {
      await prisma.newspaperClip.update({
        where: { id: numId },
        data: { image: { disconnect: true } },
      });
      await deleteMediaFile(existing.image);
      await prisma.media.delete({
        where: { id: existing.image.id },
      });
    }
  }

  const updateData = {};
  if (rest.title !== undefined) updateData.title = rest.title;
  if (rest.date !== undefined) updateData.date = rest.date;
  if (rest.isAvailable !== undefined) updateData.isAvailable = Boolean(rest.isAvailable);
  if (imageId) updateData.image = { connect: { id: imageId } };

  return prisma.newspaperClip.update({
    where: { id: numId },
    data: updateData,
    include: { image: true },
  });
};

// Delete Newspaper Clip (admin)
export const deleteNewspaperClip = async (id) => {
  const numId = parseInt(id);
  const existing = await prisma.newspaperClip.findUnique({
    where: { id: numId },
    include: { image: true },
  });

  if (existing) {
    await prisma.newspaperClip.delete({ where: { id: numId } });
    if (existing.image) {
      await deleteMediaFile(existing.image);
      await prisma.media.delete({ where: { id: existing.image.id } });
    }
  }
  return existing;
};

// Get all Newspaper Clips (admin)
export const getAllNewspaperClips = async (query = {}) => {
  const { limit, page } = query;
  if (page && limit) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    const [clips, total] = await Promise.all([
      prisma.newspaperClip.findMany({
        include: { image: true },
        orderBy: { id: "asc" },
        take,
        skip,
      }),
      prisma.newspaperClip.count(),
    ]);
    return {
      clips,
      total,
      page: parseInt(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  const clips = await prisma.newspaperClip.findMany({
    include: { image: true },
    orderBy: { id: "asc" },
  });
  return { clips };
};

// Get available Newspaper Clips (public)
export const getAvailableNewspaperClips = async (query = {}) => {
  const { limit, page } = query;
  const where = { isAvailable: true };

  if (page && limit) {
    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;
    const [clips, total] = await Promise.all([
      prisma.newspaperClip.findMany({
        where,
        include: { image: true },
        orderBy: { id: "asc" },
        take,
        skip,
      }),
      prisma.newspaperClip.count({ where }),
    ]);
    return {
      clips,
      total,
      page: parseInt(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }

  const clips = await prisma.newspaperClip.findMany({
    where,
    include: { image: true },
    orderBy: { id: "asc" },
  });
  return { clips };
};

// Get single Newspaper Clip by id
export const getNewspaperClipById = async (id) => {
  return prisma.newspaperClip.findUnique({
    where: { id: parseInt(id) },
    include: { image: true },
  });
};
