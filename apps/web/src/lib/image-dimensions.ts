/**
 * Natural image size, read in the browser before upload (spec 034 FR-019).
 *
 * The archive stores width and height so a masonry tile reserves its shape before the
 * image loads. The size recorded is the size shown: EXIF orientation is applied, so a
 * portrait taken with the camera turned reads as a portrait.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

function valid(width: number, height: number): ImageDimensions | null {
  return width > 0 && height > 0 ? { width, height } : null;
}

function readWithImageElement(file: Blob): Promise<ImageDimensions | null> {
  if (
    typeof Image === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(valid(image.naturalWidth, image.naturalHeight));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}

/**
 * Reads the size an image is displayed at. Resolves null, never rejects, when the
 * browser cannot decode the file (HEIC in most browsers, for example): the upload goes
 * ahead without dimensions and an admin backfill fills them later.
 */
export async function readImageDimensions(
  file: Blob
): Promise<ImageDimensions | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      const size = valid(bitmap.width, bitmap.height);
      bitmap.close();
      if (size) return size;
    } catch {
      // Fall back to an <img>, which some browsers decode where bitmaps fail
    }
  }
  return readWithImageElement(file);
}
