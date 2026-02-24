// src/utils/dateUtils.ts
export function formatDateMMDDYY(dateStr: string) {
  if (!dateStr) return "";

  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);

  return `${mm}/${dd}/${yy}`;
}


export const getTodayDate = (): string => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60000);
  return localDate.toISOString().split("T")[0];
};