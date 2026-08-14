import prisma from "../../config/prisma.js";
import slugify from "slugify";
import fs from "fs";
import path from "path";

const defaultBlogInclude = {
  coverImage: true,
  gallery: true,
  activities: {
    orderBy: { sortOrder: "asc" },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        include: {
          media: true,
        },
      },
    },
  },
};

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
  let { title, slug, coverImageId, galleryIds, activities = [], ...rest } = data;
  if (!slug) {
    slug = slugify(title, { lower: true, strict: true });
  }
  // Ensure unique slug
  let uniqueSlug = slug;
  let count = 1;
  while (await prisma.blog.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${count++}`;
  }

  // Build activities data
  const activitiesCreateData = [];
  for (let i = 0; i < activities.length; i++) {
    const act = activities[i];
    const actFiles = act.files || [];
    const mediaRecords = await createMediaFromFiles(actFiles);

    activitiesCreateData.push({
      title: act.title || "",
      description: act.description || "",
      sortOrder: typeof act.sortOrder === "number" ? act.sortOrder : i,
      images: {
        create: mediaRecords.map((media, imgIdx) => ({
          media: { connect: { id: media.id } },
          sortOrder:
            Array.isArray(act.imageOrders) && act.imageOrders[imgIdx] !== undefined
              ? Number(act.imageOrders[imgIdx])
              : imgIdx,
        })),
      },
    });
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
      ...(activitiesCreateData.length
        ? { activities: { create: activitiesCreateData } }
        : {}),
    },
    include: defaultBlogInclude,
  });
};

// Update blog (admin)
export const updateBlog = async (id, data) => {
  let {
    title,
    slug,
    coverImageId,
    galleryIds,
    removeGalleryIds = [],
    removeCoverImage,
    activities = [],
    removeActivityIds = [],
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
    include: defaultBlogInclude,
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

  // Handle removed activities
  if (removeActivityIds.length) {
    const activitiesToRemove = existingBlog.activities.filter((act) =>
      removeActivityIds.includes(act.id),
    );
    for (const act of activitiesToRemove) {
      for (const img of act.images || []) {
        if (img.media) mediaToDelete.push(img.media);
      }
    }
    await prisma.blogActivity.deleteMany({
      where: { id: { in: removeActivityIds }, blogId: id },
    });
  }

  // Handle activities create / update
  if (activities.length) {
    for (let i = 0; i < activities.length; i++) {
      const act = activities[i];
      const actSortOrder = typeof act.sortOrder === "number" ? act.sortOrder : i;

      if (act.id) {
        // Update existing activity
        const existingActivity = existingBlog.activities.find((a) => a.id === act.id);
        if (existingActivity) {
          // Remove specified images
          if (act.removeImageIds?.length) {
            const imagesToRemove = existingActivity.images.filter(
              (img) =>
                act.removeImageIds.includes(img.id) ||
                act.removeImageIds.includes(img.mediaId),
            );
            for (const img of imagesToRemove) {
              if (img.media) mediaToDelete.push(img.media);
            }
            await prisma.blogActivityImage.deleteMany({
              where: {
                id: { in: imagesToRemove.map((img) => img.id) },
              },
            });
          }

          // Update existing image sort orders
          if (act.existingImages?.length) {
            for (const existImg of act.existingImages) {
              await prisma.blogActivityImage.updateMany({
                where: {
                  activityId: act.id,
                  OR: [{ id: existImg.id }, { mediaId: existImg.id }],
                },
                data: { sortOrder: existImg.sortOrder },
              });
            }
          }

          // Upload new images for this activity
          const actFiles = act.files || [];
          if (actFiles.length) {
            const newMediaRecords = await createMediaFromFiles(actFiles);
            const currentImgCount = existingActivity.images.length;
            await prisma.blogActivityImage.createMany({
              data: newMediaRecords.map((media, imgIdx) => ({
                activityId: act.id,
                mediaId: media.id,
                sortOrder:
                  Array.isArray(act.imageOrders) && act.imageOrders[imgIdx] !== undefined
                    ? Number(act.imageOrders[imgIdx])
                    : currentImgCount + imgIdx,
              })),
            });
          }

          // Update activity text fields
          await prisma.blogActivity.update({
            where: { id: act.id },
            data: {
              title: act.title !== undefined ? act.title : existingActivity.title,
              description:
                act.description !== undefined
                  ? act.description
                  : existingActivity.description,
              sortOrder: actSortOrder,
            },
          });
        }
      } else if (act.title || (act.files && act.files.length)) {
        // Create new activity under this blog
        const actFiles = act.files || [];
        const newMediaRecords = await createMediaFromFiles(actFiles);
        await prisma.blogActivity.create({
          data: {
            blogId: id,
            title: act.title || "",
            description: act.description || "",
            sortOrder: actSortOrder,
            images: {
              create: newMediaRecords.map((media, imgIdx) => ({
                media: { connect: { id: media.id } },
                sortOrder:
                  Array.isArray(act.imageOrders) && act.imageOrders[imgIdx] !== undefined
                    ? Number(act.imageOrders[imgIdx])
                    : imgIdx,
              })),
            },
          },
        });
      }
    }
  }

  const updated = await prisma.blog.update({
    where: { id },
    data: updateData,
    include: defaultBlogInclude,
  });

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
    include: defaultBlogInclude,
  });
  if (!blog) return null;

  await prisma.blog.delete({ where: { id } });

  const mediaToDelete = [blog.coverImage, ...(blog.gallery || [])].filter(
    Boolean,
  );

  for (const act of blog.activities || []) {
    for (const img of act.images || []) {
      if (img.media) mediaToDelete.push(img.media);
    }
  }

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
    include: defaultBlogInclude,
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
    include: defaultBlogInclude,
  });
};

// Get all blogs (admin)
export const getAllBlogs = async () => {
  return prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
    include: defaultBlogInclude,
  });
};

// Get single blog by id (admin)
export const getBlogById = async (id) => {
  return prisma.blog.findUnique({
    where: { id },
    include: defaultBlogInclude,
  });
};

// Get single blog by slug (user)
export const getPublishedBlogBySlug = async (slug) => {
  return prisma.blog.findFirst({
    where: { slug, published: true },
    include: defaultBlogInclude,
  });
};

// Get all published blogs (user)
export const getPublishedBlogs = async () => {
  return prisma.blog.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: defaultBlogInclude,
  });
};
