import asyncHandler from "../../middleware/async.js";
import * as tvMediaService from "./tvMedia.service.js";
import ErrorResponse from "../../utils/errorResponse.js";

// @desc    Get all active/available TV media reports
// @route   GET /api/v1/tv-media
// @access  Public
export const getActiveTvMediaReports = asyncHandler(async (req, res, next) => {
  const result = await tvMediaService.getAvailableTvMediaReports(req.query);

  if (result.page !== undefined) {
    return res.status(200).json({
      success: true,
      count: result.reports.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.reports,
    });
  }

  res.status(200).json({
    success: true,
    count: result.reports.length,
    data: result.reports,
  });
});

// @desc    Get all TV media reports (Admin)
// @route   GET /api/v1/tv-media/all
// @access  Private/Admin
export const getAllTvMediaReports = asyncHandler(async (req, res, next) => {
  const result = await tvMediaService.getAllTvMediaReports(req.query);

  if (result.page !== undefined) {
    return res.status(200).json({
      success: true,
      count: result.reports.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      data: result.reports,
    });
  }

  res.status(200).json({
    success: true,
    count: result.reports.length,
    data: result.reports,
  });
});

// @desc    Get single TV media report by ID
// @route   GET /api/v1/tv-media/:id
// @access  Public
export const getTvMediaReportById = asyncHandler(async (req, res, next) => {
  const report = await tvMediaService.getTvMediaReportById(req.params.id);
  if (!report) {
    return next(
      new ErrorResponse(`TV media report not found with id of ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    success: true,
    data: report,
  });
});

// @desc    Add TV media report
// @route   POST /api/v1/tv-media
// @access  Private/Admin
export const addTvMediaReport = asyncHandler(async (req, res, next) => {
  const { channel, topic, link } = req.body;

  if (!channel || !topic || !link) {
    return next(
      new ErrorResponse("Please provide channel, topic, and link for the media report", 400),
    );
  }

  const report = await tvMediaService.createTvMediaReport(req.body);

  res.status(201).json({
    success: true,
    message: "TV Media Report created successfully",
    data: report,
  });
});

// @desc    Update TV media report
// @route   PUT /api/v1/tv-media/:id
// @access  Private/Admin
export const updateTvMediaReport = asyncHandler(async (req, res, next) => {
  let report = await tvMediaService.getTvMediaReportById(req.params.id);
  if (!report) {
    return next(
      new ErrorResponse(`TV media report not found with id of ${req.params.id}`, 404),
    );
  }

  report = await tvMediaService.updateTvMediaReport(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "TV Media Report updated successfully",
    data: report,
  });
});

// @desc    Delete TV media report
// @route   DELETE /api/v1/tv-media/:id
// @access  Private/Admin
export const deleteTvMediaReport = asyncHandler(async (req, res, next) => {
  const report = await tvMediaService.getTvMediaReportById(req.params.id);
  if (!report) {
    return next(
      new ErrorResponse(`TV media report not found with id of ${req.params.id}`, 404),
    );
  }

  await tvMediaService.deleteTvMediaReport(req.params.id);

  res.status(200).json({
    success: true,
    message: "TV Media Report deleted successfully",
    data: null,
  });
});
