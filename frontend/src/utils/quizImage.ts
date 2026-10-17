import { API_URL } from "./constants.ts";

/**
 * Normalizes quiz image URLs.
 * Supports:
 * - base64 strings ('data:image/...')
 * - blob URLs ('blob:...')
 * - external URLs ('http://...', 'https://...')
 * - relative API URLs ('/api/quiz/images/...')
 */
export function getQuizImageUrl(src: string): string {
  if (!src) return "";
  if (
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  ) {
    return src;
  }
  return `${API_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}
