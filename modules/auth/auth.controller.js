import * as userService from "../services/user.service.js";

export const createUser = async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
};

export const getUsers = async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
};
