import asyncHandler from "./async.js";
import { convertToWebP } from "../utils/imageUtils.js";

/**
 * Middleware to process uploaded images and convert them to WebP.
 * Handles both req.file and req.files.
 */
const imageProcess = asyncHandler(async (req, res, next) => {
  // Handle single file
  if (req.file && req.file.mimetype.startsWith("image/")) {
    req.file = await convertToWebP(req.file);
  }

  // Handle multiple files or fields
  if (req.files) {
    if (Array.isArray(req.files)) {
      req.files = await Promise.all(
        req.files.map(async (file) => {
          if (file && file.mimetype && file.mimetype.startsWith("image/")) {
            return await convertToWebP(file);
          }
          return file;
        })
      );
    } else {
      const fileKeys = Object.keys(req.files);
      for (const key of fileKeys) {
        const files = req.files[key];
        if (Array.isArray(files)) {
          const processedFiles = await Promise.all(
            files.map(async (file) => {
              if (file && file.mimetype && file.mimetype.startsWith("image/")) {
                return await convertToWebP(file);
              }
              return file;
            })
          );
          req.files[key] = processedFiles;
        } else if (files && typeof files === "object" && files.mimetype?.startsWith("image/")) {
          req.files[key] = await convertToWebP(files);
        }
      }
    }
  }

  next();
});

export default imageProcess;
