import sharp from "sharp";
import fs from "fs";
import path from "path";

/**
 * Converts an image to WebP format and deletes the original.
 * @param {Object} file - The file object from Multer.
 * @returns {Promise<Object>} - Updated file object.
 */
export const convertToWebP = async (file) => {
  if (!file || !file.path) return file;

  const originalPath = file.path;
  const directory = path.dirname(originalPath);
  const originalFilename = file.filename;
  const nameWithoutExt = path.parse(originalFilename).name;
  const webpFilename = `${nameWithoutExt}.webp`;
  const webpPath = path.join(directory, webpFilename);

  try {
    // Process with sharp
    await sharp(originalPath)
      .webp({ quality: 80 })
      .toFile(webpPath);

    // Get new file size
    const stats = await fs.promises.stat(webpPath);

    // Delete original file
    if (fs.existsSync(originalPath)) {
      await fs.promises.unlink(originalPath);
    }

    // Update file object
    file.path = webpPath;
    file.filename = webpFilename;
    file.mimetype = "image/webp";
    file.size = stats.size;
    
    // Update destination if needed (standard Multer property)
    // file.destination remains the same

    return file;
  } catch (error) {
    console.error(`Error converting ${originalPath} to WebP:`, error);
    // If conversion fails, keep the original file and continue
    return file;
  }
};
