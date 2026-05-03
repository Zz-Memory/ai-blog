const chinaDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const chinaDateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatChinaDate(date: string | Date) {
  return chinaDateFormatter.format(typeof date === "string" ? new Date(date) : date);
}

export function formatChinaDateTime(date: string | Date) {
  return chinaDateTimeFormatter.format(typeof date === "string" ? new Date(date) : date);
}
