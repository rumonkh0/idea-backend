import asyncHandler from "../../middleware/async.js";
import * as noticeService from "./notice.service.js";
import ErrorResponse from "../../utils/errorResponse.js";

const VALID_CATEGORIES = ["Urgent", "General", "CourseUpdate", "Event"];

// @desc    Get all notices
// @route   GET /api/v1/notices
// @access  Public
export const getAllNotices = asyncHandler(async (req, res, next) => {
  const result = await noticeService.getAllNotices(req.query);

  if (result.page !== undefined) {
    return res.status(200).json({
      success: true,
      count: result.notices.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.notices,
    });
  }

  res.status(200).json({
    success: true,
    count: result.notices.length,
    data: result.notices,
  });
});

// @desc    Get single notice
// @route   GET /api/v1/notices/:id
// @access  Public
export const getNoticeById = asyncHandler(async (req, res, next) => {
  const notice = await noticeService.getNoticeById(req.params.id);
  if (!notice) {
    return next(
      new ErrorResponse(`Notice not found with id of ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    success: true,
    data: notice,
  });
});

// @desc    Create new notice
// @route   POST /api/v1/notices
// @access  Private/Admin
export const createNotice = asyncHandler(async (req, res, next) => {
  const { title, excerpt, content, category } = req.body;

  if (!title || !excerpt || !content) {
    return next(
      new ErrorResponse(
        "Please provide title, excerpt, and content for the notice",
        400,
      ),
    );
  }

  if (category && !VALID_CATEGORIES.includes(category)) {
    return next(
      new ErrorResponse(
        `Invalid category '${category}'. Valid categories are: ${VALID_CATEGORIES.join(", ")}`,
        400,
      ),
    );
  }

  const notice = await noticeService.createNotice(req.body);

  res.status(201).json({
    success: true,
    message: "Notice created successfully",
    data: notice,
  });
});

// @desc    Update notice
// @route   PUT /api/v1/notices/:id
// @access  Private/Admin
export const updateNotice = asyncHandler(async (req, res, next) => {
  const { category } = req.body;

  let notice = await noticeService.getNoticeById(req.params.id);
  if (!notice) {
    return next(
      new ErrorResponse(`Notice not found with id of ${req.params.id}`, 404),
    );
  }

  if (category && !VALID_CATEGORIES.includes(category)) {
    return next(
      new ErrorResponse(
        `Invalid category '${category}'. Valid categories are: ${VALID_CATEGORIES.join(", ")}`,
        400,
      ),
    );
  }

  notice = await noticeService.updateNotice(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Notice updated successfully",
    data: notice,
  });
});

// @desc    Delete notice
// @route   DELETE /api/v1/notices/:id
// @access  Private/Admin
export const deleteNotice = asyncHandler(async (req, res, next) => {
  const notice = await noticeService.getNoticeById(req.params.id);
  if (!notice) {
    return next(
      new ErrorResponse(`Notice not found with id of ${req.params.id}`, 404),
    );
  }

  await noticeService.deleteNotice(req.params.id);

  res.status(200).json({
    success: true,
    message: "Notice deleted successfully",
    data: null,
  });
});
