export const parseListItems = (text: string): string[] => {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim().replace(/^(\d+[.)]\s*|[-*•]\s*)/, "").trim())
    .filter((line) => line.length > 0);
};

export const formatChatTime = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};
