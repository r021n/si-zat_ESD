// In-memory server cache for announcements list to reduce Turso roundtrips
let announcementsServerCache: {
  data: any;
  timestamp: number;
} | null = null;

export const ANNOUNCEMENTS_SERVER_TTL_MS = 30 * 1000;

export function getAnnouncementsServerCache() {
  return announcementsServerCache;
}

export function setAnnouncementsServerCache(
  data: any,
  timestamp: number = Date.now(),
) {
  announcementsServerCache = { data, timestamp };
}

export function invalidateAnnouncementsServerCache() {
  announcementsServerCache = null;
}
