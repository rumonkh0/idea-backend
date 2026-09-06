import asyncHandler from "../../middleware/async.js";
import * as newspaperClipService from "./newspaperClip.service.js";
import ErrorResponse from "../../utils/errorResponse.js";

// @desc    Get active/available newspaper clips
// @route   GET /api/v1/newspaper-clips
// @access  Public
export const getActiveNewspaperClips = asyncHandler(async (req, res, next) => {
  const result = await newspaperClipService.getAvailableNewspaperClips(req.query);

  if (result.page !== undefined) {
    return res.status(200).json({
      success: true,
      count: result.clips.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.clips,
    });
  }

  res.status(200).json({
    success: true,
    count: result.clips.length,
    data: result.clips,
  });
});

// @desc    Get all newspaper clips (Admin)
// @route   GET /api/v1/newspaper-clips/all
// @access  Private/Admin
export const getAllNewspaperClips = asyncHandler(async (req, res, next) => {
  const result = await newspaperClipService.getAllNewspaperClips(req.query);

  if (result.page !== undefined) {
    return res.status(200).json({
      success: true,
      count: result.clips.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.clips,
    });
  }

  res.status(200).json({
    success: true,
    count: result.clips.length,
    data: result.clips,
  });
});

// @desc    Get single newspaper clip by ID
// @route   GET /api/v1/newspaper-clips/:id
// @access  Public
export const getNewspaperClipById = asyncHandler(async (req, res, next) => {
  const clip = await newspaperClipService.getNewspaperClipById(req.params.id);
  if (!clip) {
    return next(
      new ErrorResponse(`Newspaper clip not found with id of ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    success: true,
    data: clip,
  });
});

// @desc    Add newspaper clip
// @route   POST /api/v1/newspaper-clips
// @access  Private/Admin
export const addNewspaperClip = asyncHandler(async (req, res, next) => {
  const { title, date } = req.body;

  let mediaRecord;
  if (req.file) {
    mediaRecord = await newspaperClipService.createMediaFromFile(req.file);
  } else if (req.body.image) {
    mediaRecord = await newspaperClipService.createMediaFromUrl(req.body.image, title);
  }

  if (!title || !date || (!mediaRecord && !req.body.imageId)) {
    return next(
      new ErrorResponse("Please provide title, date, and image file/url for the newspaper clip", 400),
    );
  }

  const clipData = {
    title,
    date,
    isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
    imageId: mediaRecord ? mediaRecord.id : (req.body.imageId ? parseInt(req.body.imageId) : null),
  };

  const clip = await newspaperClipService.createNewspaperClip(clipData);

  res.status(201).json({
    success: true,
    message: "Newspaper clip created successfully",
    data: clip,
  });
});

// @desc    Update newspaper clip
// @route   PUT /api/v1/newspaper-clips/:id
// @access  Private/Admin
export const updateNewspaperClip = asyncHandler(async (req, res, next) => {
  let clip = await newspaperClipService.getNewspaperClipById(req.params.id);
  if (!clip) {
    return next(
      new ErrorResponse(`Newspaper clip not found with id of ${req.params.id}`, 404),
    );
  }

  const updateData = { ...req.body };

  if (req.file) {
    const mediaRecord = await newspaperClipService.createMediaFromFile(req.file);
    updateData.imageId = mediaRecord.id;
  } else if (req.body.image) {
    const mediaRecord = await newspaperClipService.createMediaFromUrl(req.body.image, req.body.title || clip.title);
    updateData.imageId = mediaRecord.id;
  }

  delete updateData.image;

  clip = await newspaperClipService.updateNewspaperClip(req.params.id, updateData);

  res.status(200).json({
    success: true,
    message: "Newspaper clip updated successfully",
    data: clip,
  });
});

// @desc    Delete newspaper clip
// @route   DELETE /api/v1/newspaper-clips/:id
// @access  Private/Admin
export const deleteNewspaperClip = asyncHandler(async (req, res, next) => {
  const clip = await newspaperClipService.getNewspaperClipById(req.params.id);
  if (!clip) {
    return next(
      new ErrorResponse(`Newspaper clip not found with id of ${req.params.id}`, 404),
    );
  }

  await newspaperClipService.deleteNewspaperClip(req.params.id);

  res.status(200).json({
    success: true,
    message: "Newspaper clip deleted successfully",
    data: null,
  });
});
