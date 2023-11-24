import { loadImage, randFloatSpread, randInt } from "@/ts/utils";
import { RGBAFormat, FloatType, DataTexture } from "three";

const greyscaleThreshold = 5;

/**
 * Loads image, reads its pixel data, returns an array of positions representing the positions
 * of its darker (below greyscale threshold) pixels.
 */
export async function getPixelDataFromImage({
  src,
  resolution,
  dataTextureWidth,
  dataTextureHeight,
}: {
  src: string;
  resolution: number;
  dataTextureWidth: number;
  dataTextureHeight: number;
}) {
  const pixels: Vec2[] = [];

  // Load the image
  let img = await loadImage(src);

  // Retrieve image dimensions
  // Reading image data is expensive to use resolution to scale down image as much as possible
  const imgWidth = img.naturalWidth * resolution;
  const imgHeight = img.naturalHeight * resolution;

  // Create the canvas unto which we'll draw texture
  const canvas = document.createElement("canvas");
  canvas.width = imgWidth;
  canvas.height = imgHeight;

  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Cannot draw 2D canvas");

  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

  // Once image is draw ontu canvas, read pixel data from canvas
  const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight).data;

  if (!imageData) throw new Error("Cannot get image data from 2D canvas");

  // Increment i by 4 since data array is representing pixels in chunks of 4 values (r, g, b and a)
  for (let i = 0; i < imageData.length; i += 4) {
    // Compute average greyscale value of pixel
    const greyscaleAverage =
      (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;

    if (greyscaleAverage < greyscaleThreshold) {
      // Compute the real pixel coodinates within image
      const x = (i / 4) % imgWidth;
      const y = Math.floor(i / 4 / imgHeight);

      // Normalize position [-1, 1] and flip Y axis
      const webglX = x / imgWidth - 0.5;
      const webglY = 0.5 - y / imgHeight;

      pixels.push({
        x: webglX,
        y: webglY,
      });
    }
  }

  // Create empty array to use as source for data texture
  const dataTextureSize = dataTextureWidth * dataTextureHeight;
  const positionDataRaw = new Float32Array(dataTextureSize * 4);

  // Adding small random offset to initial particules positions to prevent "gridy" structure
  const randOffsetSpread = 0.005;

  for (let y = 0; y < dataTextureHeight; y++) {
    for (let x = 0; x < dataTextureWidth; x++) {
      const index = x + dataTextureWidth * y;

      // Choose random pixel from pool
      // FIXME: Same pixel can be picked twice
      const pixel = pixels[randInt(0, pixels.length - 1)];

      // In rare cases, randomize the position for aesthetic purposes.
      // Multiply by 3 to cover the whole scene
      // if (Math.random() > 0.9) {
      //   pixel.x = (Math.random() - 0.5) * 3;
      //   pixel.y = (Math.random() - 0.5) * 3;
      // }

      // Store choosen pixel position as color information within data texture
      const r = pixel.x + randFloatSpread(randOffsetSpread); // X position
      const g = pixel.y + randFloatSpread(randOffsetSpread); // Y position
      const b = 0; //(Math.random() - 0.5) * 0.01; // X velocity
      const a = 0; //(Math.random() - 0.5) * 0.01; // Y velocity

      positionDataRaw[4 * index + 0] = r;
      positionDataRaw[4 * index + 1] = g;
      positionDataRaw[4 * index + 2] = b;
      positionDataRaw[4 * index + 3] = a;
    }
  }

  const positionsDataTexture = new DataTexture(
    positionDataRaw,
    dataTextureWidth,
    dataTextureHeight,
    RGBAFormat,
    FloatType
  );
  positionsDataTexture.needsUpdate = true;

  return positionsDataTexture;
}
