import asyncHandler from "../../middleware/async.js";
import * as blogService from "./blog.service.js";
import ErrorResponse from "../../utils/errorResponse.js";

const parsePublished = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return undefined;
};

const buildBlogPayload = (body) => {
  const payload = {
    title: body.title,
    slug: body.slug,
    description: body.description,
  };
  const published = parsePublished(body.published);
  if (published !== undefined) payload.published = published;
  return payload;
};

// Admin: Add blog
export const addBlog = asyncHandler(async (req, res, next) => {
  const payload = buildBlogPayload(req.body);
  if (!payload.title || !payload.description) {
    return next(new ErrorResponse("Title and description are required", 400));
  }

  const coverFile = req.files?.coverImage?.[0];
  const galleryFiles = req.files?.gallery || [];

  const coverImage = coverFile
    ? await blogService.createMediaFromFile(coverFile)
    : null;
  const galleryMedia = galleryFiles.length
    ? await blogService.createMediaFromFiles(galleryFiles)
    : [];

  const blog = await blogService.createBlog({
    ...payload,
    coverImageId: coverImage?.id,
    galleryIds: galleryMedia.map((m) => m.id),
  });
  res.status(201).json({ success: true, message: "Blog created", data: blog });
});

// Admin: Edit blog
export const editBlog = asyncHandler(async (req, res) => {
  const payload = buildBlogPayload(req.body);
  const rawRemoveGalleryIds = req.body.removeGalleryIds;
  let removeGalleryIds = [];

  if (Array.isArray(rawRemoveGalleryIds)) {
    removeGalleryIds = rawRemoveGalleryIds.map((id) => Number(id));
  } else if (typeof rawRemoveGalleryIds === "string") {
    try {
      const parsed = JSON.parse(rawRemoveGalleryIds);
      if (Array.isArray(parsed)) {
        removeGalleryIds = parsed.map((id) => Number(id));
      } else {
        removeGalleryIds = rawRemoveGalleryIds
          .split(",")
          .map((id) => Number(id.trim()));
      }
    } catch {
      removeGalleryIds = rawRemoveGalleryIds
        .split(",")
        .map((id) => Number(id.trim()));
    }
  }
  removeGalleryIds = removeGalleryIds.filter(Boolean);

  const removeCoverImage =
    typeof req.body.removeCoverImage === "string"
      ? req.body.removeCoverImage.toLowerCase() === "true"
      : Boolean(req.body.removeCoverImage);

  const coverFile = req.files?.coverImage?.[0];
  const galleryFiles = req.files?.gallery || [];

  const coverImage = coverFile
    ? await blogService.createMediaFromFile(coverFile)
    : null;
  const galleryMedia = galleryFiles.length
    ? await blogService.createMediaFromFiles(galleryFiles)
    : [];

  const blog = await blogService.updateBlog(Number(req.params.id), {
    ...payload,
    coverImageId: coverImage?.id,
    galleryIds: galleryMedia.map((m) => m.id),
    removeGalleryIds,
    removeCoverImage,
  });
  res.status(200).json({ success: true, message: "Blog updated", data: blog });
});

// Admin: Delete blog
export const deleteBlog = asyncHandler(async (req, res) => {
  await blogService.deleteBlog(Number(req.params.id));
  res.status(200).json({ success: true, message: "Blog deleted", data: null });
});

// Admin: Remove one gallery image
export const removeGalleryImage = asyncHandler(async (req, res, next) => {
  const blogId = Number(req.params.id);
  const mediaId = Number(req.params.mediaId);
  const result = await blogService.removeGalleryMedia(blogId, mediaId);
  if (!result) {
    return next(new ErrorResponse("Blog not found", 404));
  }
  if (!result.media) {
    return next(new ErrorResponse("Gallery media not found", 404));
  }
  res.status(200).json({
    success: true,
    message: "Gallery media removed",
    data: result.media,
  });
});

// Admin: Publish/unpublish blog
export const publishBlog = asyncHandler(async (req, res) => {
  const { published } = req.body;
  const blog = await blogService.setBlogPublished(
    Number(req.params.id),
    published,
  );
  res.status(200).json({
    success: true,
    message: `Blog ${published ? "published" : "unpublished"}`,
    data: blog,
  });
});

// Admin: Get all blogs
export const getAllBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogService.getAllBlogs();
  res.status(200).json({ success: true, count: blogs.length, data: blogs });
});

// Admin: Get blog by id
export const getBlogById = asyncHandler(async (req, res) => {
  const blog = await blogService.getBlogById(Number(req.params.id));
  if (!blog)
    return res
      .status(404)
      .json({ success: false, message: "Blog not found", data: null });
  res.status(200).json({ success: true, data: blog });
});

// User: Get all published blogs
export const getPublishedBlogs = asyncHandler(async (req, res) => {
  const blogs = await blogService.getPublishedBlogs();
  res.status(200).json({ success: true, count: blogs.length, data: blogs });
});

// User: Get published blog by slug
export const getPublishedBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await blogService.getPublishedBlogBySlug(req.params.slug);
  if (!blog)
    return res
      .status(404)
      .json({ success: false, message: "Blog not found", data: null });
  res.status(200).json({ success: true, data: blog });
});
