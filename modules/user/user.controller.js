import * as userService from "./user.service.js";
import asyncHandler from "../../middleware/async.js";

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers();
  res.status(200).json({
    success: true,
    data: users,
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  const user = await userService.getUserById(userId);
  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  const user = await userService.updateUser(userId, req.body);
  res.status(200).json({
    success: true,
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  await userService.deleteUser(userId);
  res.status(204).json({
    success: true,
    message: "User deleted successfully",
  });
});

export const getUserByEmail = asyncHandler(async (req, res) => {
  const user = await userService.getUserByEmail(req.params.email);
  res.status(200).json({
    success: true,
    data: user,
  });
});
