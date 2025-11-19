import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

/**
 * Capture a single frame from a live video stream (RTSP, HTTP, Webcam)
 * Returns the frame as a base64-encoded JPEG
 */
export async function captureStreamFrame(streamUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      "-hide_banner",
      "-loglevel", "error",
      "-rtsp_transport", "tcp", // For RTSP streams
      "-i", streamUrl,
      "-vframes", "1",
      "-f", "image2pipe",
      "-vcodec", "mjpeg",
      "-q:v", "2",
      "pipe:1",
    ];

    const ffmpeg = spawn(ffmpegPath as string, args);
    const chunks: Buffer[] = [];
    let errorOutput = "";

    ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));
    ffmpeg.stderr.on("data", (chunk) => errorOutput += chunk.toString());

    const timeout = setTimeout(() => {
      ffmpeg.kill();
      reject(new Error("Stream capture timeout after 15 seconds"));
    }, 15000);

    ffmpeg.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0 && chunks.length > 0) {
        const frameBuffer = Buffer.concat(chunks);
        const base64Frame = frameBuffer.toString("base64");
        resolve(`data:image/jpeg;base64,${base64Frame}`);
      } else {
        reject(new Error(`Failed to capture frame: ${errorOutput || 'Unknown error'}`));
      }
    });

    ffmpeg.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * Validate that a stream URL is accessible
 */
export async function validateStreamUrl(streamUrl: string): Promise<boolean> {
  try {
    await captureStreamFrame(streamUrl);
    return true;
  } catch (error) {
    console.error("Stream validation failed:", error);
    return false;
  }
}
