import { execFile } from "child_process";
import { promisify } from "util";

const execFilePromise = promisify(execFile);

/**
 * Get video duration in seconds using ffprobe.
 * High performance since it only reads the container header.
 * @param {string} filePath Path to the video file.
 * @returns {Promise<number>} Duration in seconds.
 */
export const getVideoDuration = async (filePath) => {
  try {
    const { stdout } = await execFilePromise("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);
    return Math.round(parseFloat(stdout));
  } catch (error) {
    console.error("Error getting video duration:", error);
    return null;
  }
};
