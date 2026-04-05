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
    const fileKeys = Object.keys(req.files);
    for (const key of fileKeys) {
      const files = req.files[key];
      if (Array.isArray(files)) {
        // Handle array of files
        const processedFiles = await Promise.all(
          files.map(async (file) => {
            if (file.mimetype.startsWith("image/")) {
              return await convertToWebP(file);
            }
            return file;
          })
        );
        req.files[key] = processedFiles;
      } else if (typeof files === "object" && files.mimetype.startsWith("image/")) {
        // Handle single file object in req.files (less common but possible)
        req.files[key] = await convertToWebP(files);
      }
    }
  }

  next();
});

export default imageProcess;
