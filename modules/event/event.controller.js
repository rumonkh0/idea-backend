import asyncHandler from "../../middleware/async.js";
import * as eventService from "./event.service.js";
import ErrorResponse from "../../utils/errorResponse.js";

// @desc    Get all events
// @route   GET /api/v1/events/all
// @access  Private/Admin
export const getAllEvents = asyncHandler(async (req, res, next) => {
  const events = await eventService.getAllEvents();
  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

// @desc    Get single event
// @route   GET /api/v1/events/admin/:id
// @access  Private/Admin
export const getEventById = asyncHandler(async (req, res, next) => {
  const event = await eventService.getEventById(req.params.id);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc    Add event
// @route   POST /api/v1/events
// @access  Private/Admin
export const addEvent = asyncHandler(async (req, res, next) => {
  const event = await eventService.createEvent(req.body);
  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: event,
  });
});

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Private/Admin
export const updateEvent = asyncHandler(async (req, res, next) => {
  let event = await eventService.getEventById(req.params.id);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }
  event = await eventService.updateEvent(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: event,
  });
});

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Private/Admin
export const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await eventService.getEventById(req.params.id);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${req.params.id}`, 404));
  }
  await eventService.deleteEvent(req.params.id);
  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
    data: null,
  });
});

// @desc    Get all active events
// @route   GET /api/v1/events
// @access  Public
export const getActiveEvents = asyncHandler(async (req, res, next) => {
  const events = await eventService.getActiveEvents();
  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

// @desc    Get single active event
// @route   GET /api/v1/events/:id
// @access  Public
export const getActiveEventById = asyncHandler(async (req, res, next) => {
  const event = await eventService.getActiveEventById(req.params.id);
  if (!event) {
    return next(new ErrorResponse(`Active event not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({
    success: true,
    data: event,
  });
});
