import * as userService from "./user.service.js";
import asyncHandler from "../../middleware/async.js";

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json(user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(204).send();
});

export const getUserByEmail = asyncHandler(async (req, res) => {
  const user = await userService.getUserByEmail(req.params.email);
  res.json(user);
});