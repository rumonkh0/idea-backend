import asyncHandler from "../../middleware/async.js";
import * as messageService from "./message.service.js";
import ErrorResponse from "../../utils/errorResponse.js";

// @desc    Send message
// @route   POST /api/v1/messages
// @access  Public
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return next(new ErrorResponse("All fields (name, email, phone, subject, message) are required", 400));
  }

  const newMessage = await messageService.createMessage(req.body);

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: newMessage,
  });
});

// @desc    Get all messages (pagination)
// @route   GET /api/v1/messages
// @access  Private/Admin
export const getAllMessages = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const result = await messageService.getMessages(page, limit);

  res.status(200).json({
    success: true,
    count: result.data.length,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    data: result.data,
  });
});

// @desc    Get single message
// @route   GET /api/v1/messages/:id
// @access  Private/Admin
export const getMessageById = asyncHandler(async (req, res, next) => {
  const message = await messageService.getMessageById(req.params.id);

  if (!message) {
    return next(new ErrorResponse(`Message not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: message,
  });
});

// @desc    Delete message
// @route   DELETE /api/v1/messages/:id
// @access  Private/Admin
export const deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await messageService.getMessageById(req.params.id);

  if (!message) {
    return next(new ErrorResponse(`Message not found with id of ${req.params.id}`, 404));
  }

  await messageService.deleteMessage(req.params.id);

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
    data: null,
  });
});
