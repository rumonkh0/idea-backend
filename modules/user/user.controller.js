import * as userService from "./user.service.js";
import asyncHandler from "../../middleware/async.js";

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers();
  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    count: users.length,
    data: users,
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  const user = await userService.getUserById(userId);
  res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  const user = await userService.updateUser(userId, req.body);
  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);
  await userService.deleteUser(userId);
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});

export const getUserByEmail = asyncHandler(async (req, res) => {
  const user = await userService.getUserByEmail(req.params.email);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found with the provided email",
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});
