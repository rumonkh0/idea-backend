import prisma from "../../config/prisma.js";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

export const createAvatarMedia = async (file) => {
  const url = `/uploads/avatars/${file.filename}`;
  return prisma.media.create({
    data: {
      url,
      type: "IMAGE",
      provider: "local",
      alt: file.originalname || "User Avatar",
      size: file.size,
      mimeType: file.mimetype,
    },
  });
};

export const deleteUserAvatarMedia = async (user) => {
  if (user?.avatarMedia) {
    const publicRoot = path.join(process.cwd(), "public");
    const filePath = path.join(publicRoot, user.avatarMedia.url);
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      if (err.code !== "ENOENT") console.error("Error deleting avatar file:", err);
    }
    await prisma.media.delete({ where: { id: user.avatarMedia.id } }).catch(() => null);
  } else if (user?.avatar && user.avatar.startsWith("/uploads/")) {
    const publicRoot = path.join(process.cwd(), "public");
    const filePath = path.join(publicRoot, user.avatar);
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      if (err.code !== "ENOENT") console.error("Error deleting avatar file:", err);
    }
  }
};

export const createUser = async (data, file) => {
  const { name, email, phone, password, role } = data;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let avatarUrl = null;
  let avatarMediaId = null;

  if (file) {
    const media = await createAvatarMedia(file);
    avatarUrl = media.url;
    avatarMediaId = media.id;
  }

  return await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      role,
      avatar: avatarUrl,
      ...(avatarMediaId
        ? { avatarMedia: { connect: { id: avatarMediaId } } }
        : {}),
    },
    include: {
      avatarMedia: true,
    },
    omit: {
      passwordHash: true,
    },
  });
};

export const getUsers = () => {
  return prisma.user.findMany({
    include: { avatarMedia: true },
    omit: { passwordHash: true },
  });
};

export const getUserById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: { avatarMedia: true },
    omit: { passwordHash: true },
  });
};

export const updateUser = async (id, data, file) => {
  const updateData = { ...data };

  // If password is provided, hash it
  if (updateData.password) {
    const hashedPassword = await bcrypt.hash(updateData.password, 10);
    updateData.passwordHash = hashedPassword;
    delete updateData.password; // remove plain password
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    include: { avatarMedia: true },
  });

  if (file) {
    if (existing) {
      await deleteUserAvatarMedia(existing);
    }
    const media = await createAvatarMedia(file);
    updateData.avatar = media.url;
    updateData.avatarId = media.id;
  } else if (updateData.removeAvatar === "true" || updateData.removeAvatar === true) {
    if (existing) {
      await deleteUserAvatarMedia(existing);
    }
    updateData.avatar = null;
    updateData.avatarId = null;
    delete updateData.removeAvatar;
  }

  const { avatarId, ...rest } = updateData;

  return prisma.user.update({
    where: { id },
    data: {
      ...rest,
      ...(avatarId !== undefined
        ? avatarId
          ? { avatarMedia: { connect: { id: avatarId } } }
          : { avatarMedia: { disconnect: true } }
        : {}),
    },
    include: {
      avatarMedia: true,
    },
    omit: {
      passwordHash: true,
    },
  });
};

export const deleteUser = async (id) => {
  const existing = await prisma.user.findUnique({
    where: { id },
    include: { avatarMedia: true },
  });
  if (existing) {
    await deleteUserAvatarMedia(existing);
  }
  return prisma.user.delete({ where: { id } });
};

export const getUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: { avatarMedia: true },
    omit: { passwordHash: true },
  });
};
