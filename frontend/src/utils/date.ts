export function formatDateIndo(
  dateInput: string | Date | undefined | null,
  includeTime = false,
): string {
  if (!dateInput) return "-";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    return d.toLocaleDateString("id-ID", options);
  } catch {
    return String(dateInput);
  }
}
