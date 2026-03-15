import prisma from "../../config/prisma.js";
import slugify from "slugify";
import fs from "fs";
import path from "path";

const getMediaType = (mimeType) => {
  if (!mimeType) return "FILE";
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

const deleteMediaFiles = async (mediaList = []) => {
  if (!mediaList.length) return;
  const publicRoot = path.join(process.cwd(), "public");
  await Promise.all(
    mediaList
      .filter((media) => media?.url)
      .map((media) => deleteFileIfExists(path.join(publicRoot, media.url))),
  );
};

export const createMediaFromFile = async (file) => {
  const url = `/uploads/blog/${file.filename}`;
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

export const createMediaFromFiles = async (files = []) => {
  if (!files.length) return [];
  return Promise.all(files.map((file) => createMediaFromFile(file)));
};

// Create blog (admin)
export const createBlog = async (data) => {
  let { title, slug, coverImageId, galleryIds, ...rest } = data;
  if (!slug) {
    slug = slugify(title, { lower: true, strict: true });
  }
  // Ensure unique slug
  let uniqueSlug = slug;
  let count = 1;
  while (await prisma.blog.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${count++}`;
  }
  return prisma.blog.create({
    data: {
      title,
      slug: uniqueSlug,
      ...rest,
      ...(coverImageId
        ? { coverImage: { connect: { id: coverImageId } } }
        : {}),
      ...(galleryIds?.length
        ? { gallery: { connect: galleryIds.map((id) => ({ id })) } }
        : {}),
    },
    include: { coverImage: true, gallery: true },
  });
};

// Update blog (admin)
export const updateBlog = async (id, data) => {
  let {
    title,
    slug,
    coverImageId,
    galleryIds,
    removeGalleryIds,
    removeCoverImage,
    ...rest
  } = data;
  let updateData = { ...rest };
  if (title) {
    updateData.title = title;
    if (!slug) {
      slug = slugify(title, { lower: true, strict: true });
    }
  }
  if (slug) {
    // Ensure unique slug
    let uniqueSlug = slug;
    let count = 1;
    while (
      await prisma.blog.findFirst({
        where: { slug: uniqueSlug, id: { not: id } },
      })
    ) {
      uniqueSlug = `${slug}-${count++}`;
    }
    updateData.slug = uniqueSlug;
  }
  const existingBlog = await prisma.blog.findUnique({
    where: { id },
    include: { coverImage: true, gallery: true },
  });
  if (!existingBlog) return null;

  const shouldRemoveCover =
    (removeCoverImage && existingBlog.coverImage) ||
    (coverImageId && existingBlog.coverImage);

  if (removeCoverImage && existingBlog.coverImage) {
    updateData.coverImage = { disconnect: true };
  }
  if (coverImageId) {
    updateData.coverImage = { connect: { id: coverImageId } };
  }
  if (galleryIds?.length) {
    updateData.gallery = {
      ...(updateData.gallery || {}),
      connect: galleryIds.map((mediaId) => ({ id: mediaId })),
    };
  }
  if (removeGalleryIds?.length) {
    updateData.gallery = {
      ...(updateData.gallery || {}),
      disconnect: removeGalleryIds.map((mediaId) => ({ id: mediaId })),
    };
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: updateData,
    include: { coverImage: true, gallery: true },
  });

  const mediaToDelete = [];
  if (shouldRemoveCover && existingBlog.coverImage) {
    mediaToDelete.push(existingBlog.coverImage);
  }
  if (removeGalleryIds?.length) {
    const galleryToRemove = existingBlog.gallery.filter((media) =>
      removeGalleryIds.includes(media.id),
    );
    mediaToDelete.push(...galleryToRemove);
  }
  if (mediaToDelete.length) {
    await deleteMediaFiles(mediaToDelete);
    await prisma.media.deleteMany({
      where: { id: { in: mediaToDelete.map((media) => media.id) } },
    });
  }

  return updated;
};

// Delete blog (admin)
export const deleteBlog = async (id) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: { coverImage: true, gallery: true },
  });
  if (!blog) return null;

  await prisma.blog.delete({ where: { id } });

  const mediaToDelete = [blog.coverImage, ...(blog.gallery || [])].filter(
    Boolean,
  );
  if (mediaToDelete.length) {
    await deleteMediaFiles(mediaToDelete);
    await prisma.media.deleteMany({
      where: { id: { in: mediaToDelete.map((media) => media.id) } },
    });
  }

  return blog;
};

export const removeGalleryMedia = async (blogId, mediaId) => {
  const blog = await prisma.blog.findUnique({
    where: { id: blogId },
    include: { gallery: true },
  });
  if (!blog) return null;

  const media = blog.gallery.find((item) => item.id === mediaId);
  if (!media) return { blog, media: null };

  await prisma.blog.update({
    where: { id: blogId },
    data: { gallery: { disconnect: { id: mediaId } } },
  });

  await deleteMediaFiles([media]);
  await prisma.media.delete({ where: { id: mediaId } });

  return { blog, media };
};

// Publish/unpublish blog (admin)
export const setBlogPublished = async (id, published) => {
  return prisma.blog.update({
    where: { id },
    data: { published },
    include: { coverImage: true, gallery: true },
  });
};

// Get all blogs (admin)
export const getAllBlogs = async () => {
  return prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
    include: { coverImage: true, gallery: true },
  });
};

// Get single blog by id (admin)
export const getBlogById = async (id) => {
  return prisma.blog.findUnique({
    where: { id },
    include: { coverImage: true, gallery: true },
  });
};

// Get single blog by slug (user)
export const getPublishedBlogBySlug = async (slug) => {
  return prisma.blog.findFirst({
    where: { slug, published: true },
    include: { coverImage: true, gallery: true },
  });
};

// Get all published blogs (user)
export const getPublishedBlogs = async () => {
  return prisma.blog.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { coverImage: true, gallery: true },
  });
};
