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

const parseNumberArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(Number).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(Number).filter(Boolean);
    } catch {}
    return value.split(",").map((v) => Number(v.trim())).filter(Boolean);
  }
  return [];
};

const parseActivities = (rawActivities, activityFilesMap = {}) => {
  if (!rawActivities) {
    // If no text activities provided, check if any activity files were sent
    const fileIndexes = Object.keys(activityFilesMap).map(Number);
    if (!fileIndexes.length) return [];
    return fileIndexes.map((idx) => ({
      title: "",
      description: "",
      sortOrder: idx,
      files: activityFilesMap[idx] || [],
    }));
  }

  let parsed = rawActivities;
  if (typeof rawActivities === "string") {
    try {
      parsed = JSON.parse(rawActivities);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) {
    if (typeof parsed === "object" && parsed !== null) parsed = [parsed];
    else return [];
  }

  return parsed.map((act, index) => {
    const actIdx =
      act.activityIndex !== undefined ? Number(act.activityIndex) : index;
    const files =
      activityFilesMap[actIdx] ||
      (act.id && activityFilesMap[act.id]) ||
      [];

    return {
      id: act.id ? Number(act.id) : undefined,
      title: act.title || "",
      description: act.description || "",
      sortOrder:
        act.sortOrder !== undefined &&
        act.sortOrder !== null &&
        !isNaN(Number(act.sortOrder))
          ? Number(act.sortOrder)
          : index,
      existingImages: Array.isArray(act.existingImages)
        ? act.existingImages.map((img, imgIdx) => ({
            id: Number(img.id || img),
            sortOrder:
              img.sortOrder !== undefined && !isNaN(Number(img.sortOrder))
                ? Number(img.sortOrder)
                : imgIdx,
          }))
        : [],
      removeImageIds: parseNumberArray(act.removeImageIds),
      imageOrders: Array.isArray(act.imageOrders)
        ? act.imageOrders.map(Number)
        : [],
      files,
    };
  });
};

const extractFiles = (req) => {
  let coverFile = null;
  const galleryFiles = [];
  const activityFilesMap = {};

  if (Array.isArray(req.files)) {
    for (const file of req.files) {
      if (file.fieldname === "coverImage") {
        coverFile = file;
      } else if (file.fieldname === "gallery") {
        galleryFiles.push(file);
      } else if (file.fieldname.startsWith("activity_")) {
        const match = file.fieldname.match(/^activity_(\d+)/);
        if (match) {
          const idx = parseInt(match[1], 10);
          if (!activityFilesMap[idx]) activityFilesMap[idx] = [];
          activityFilesMap[idx].push(file);
        } else {
          if (!activityFilesMap[0]) activityFilesMap[0] = [];
          activityFilesMap[0].push(file);
        }
      } else if (file.fieldname === "activityImages") {
        if (!activityFilesMap[0]) activityFilesMap[0] = [];
        activityFilesMap[0].push(file);
      }
    }
  } else if (req.files && typeof req.files === "object") {
    coverFile = req.files.coverImage?.[0] || null;
    if (Array.isArray(req.files.gallery)) {
      galleryFiles.push(...req.files.gallery);
    }
    for (const key of Object.keys(req.files)) {
      if (key.startsWith("activity_")) {
        const match = key.match(/^activity_(\d+)/);
        if (match) {
          const idx = parseInt(match[1], 10);
          if (!activityFilesMap[idx]) activityFilesMap[idx] = [];
          activityFilesMap[idx].push(...req.files[key]);
        }
      }
    }
  }

  return { coverFile, galleryFiles, activityFilesMap };
};

// Admin: Add blog
export const addBlog = asyncHandler(async (req, res, next) => {
  const payload = buildBlogPayload(req.body);
  if (!payload.title || !payload.description) {
    return next(new ErrorResponse("Title and description are required", 400));
  }

  const { coverFile, galleryFiles, activityFilesMap } = extractFiles(req);

  const coverImage = coverFile
    ? await blogService.createMediaFromFile(coverFile)
    : null;
  const galleryMedia = galleryFiles.length
    ? await blogService.createMediaFromFiles(galleryFiles)
    : [];

  const activities = parseActivities(req.body.activities, activityFilesMap);

  const blog = await blogService.createBlog({
    ...payload,
    coverImageId: coverImage?.id,
    galleryIds: galleryMedia.map((m) => m.id),
    activities,
  });
  res.status(201).json({ success: true, message: "Blog created", data: blog });
});

// Admin: Edit blog
export const editBlog = asyncHandler(async (req, res) => {
  const payload = buildBlogPayload(req.body);
  const removeGalleryIds = parseNumberArray(req.body.removeGalleryIds);
  const removeActivityIds = parseNumberArray(req.body.removeActivityIds);

  const removeCoverImage =
    typeof req.body.removeCoverImage === "string"
      ? req.body.removeCoverImage.toLowerCase() === "true"
      : Boolean(req.body.removeCoverImage);

  const { coverFile, galleryFiles, activityFilesMap } = extractFiles(req);

  const coverImage = coverFile
    ? await blogService.createMediaFromFile(coverFile)
    : null;
  const galleryMedia = galleryFiles.length
    ? await blogService.createMediaFromFiles(galleryFiles)
    : [];

  const activities = parseActivities(req.body.activities, activityFilesMap);

  const blog = await blogService.updateBlog(Number(req.params.id), {
    ...payload,
    coverImageId: coverImage?.id,
    galleryIds: galleryMedia.map((m) => m.id),
    removeGalleryIds,
    removeCoverImage,
    activities,
    removeActivityIds,
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
