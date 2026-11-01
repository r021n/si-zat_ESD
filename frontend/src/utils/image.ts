/**
 * Canvas-based client-side image compression helper for safe uploads
 */
export function compressImage(
  file: File,
  maxSizeBytes: number = 200 * 1024,
  maxDimension: number = 1200,
): Promise<Blob> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    if (file.size <= maxSizeBytes) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        const attempt = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              if (blob.size <= maxSizeBytes || quality <= 0.2) {
                resolve(blob);
              } else {
                quality -= 0.15;
                attempt();
              }
            },
            "image/jpeg",
            quality,
          );
        };

        attempt();
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Sequential batch compression for multiple images to avoid UI thread freeze and peak RAM spikes.
 */
export async function compressImagesBatch(
  files: File[],
  maxSizeBytes: number = 250 * 1024,
  maxDimension: number = 1200,
  onProgress?: (completed: number, total: number) => void,
): Promise<File[]> {
  const result: File[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const blob = await compressImage(file, maxSizeBytes, maxDimension);
      const compressedFile = new File([blob], file.name, {
        type: blob.type || "image/jpeg",
      });
      result.push(compressedFile);
    } catch (err) {
      console.error(`Failed to compress ${file.name}, using original:`, err);
      result.push(file);
    }
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  return result;
}
