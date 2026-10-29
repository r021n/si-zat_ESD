export const PATH_MENU_MAP: Record<string, string> = {
  "/materi": "menu materi",
  "/simulasi": "menu simulasi",
  "/simulasi/air": "menu pencemaran air",
  "/simulasi/eutrofikasi": "menu eutrofikasi",
  "/simulasi/tanah": "menu pencemaran tanah",
  "/simulasi/udara": "menu pencemaran udara",
  "/kuis": "menu kuis",
  "/kuis/berpikir-sistem": "menu berpikir sistem",
  "/profil-pengembang": "menu profil pengembang",
  "/profile-report": "menu profil & report",
};

export function getMenuKeyFromPathname(pathname: string): string {
  if (PATH_MENU_MAP[pathname]) {
    return PATH_MENU_MAP[pathname];
  }
  if (pathname.startsWith("/ruang-diskusi")) {
    return "menu ruang diskusi";
  }
  return "";
}
