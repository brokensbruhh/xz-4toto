export function toISODate(date: Date) {
  return date.toISOString().split("T")[0];
}

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function daysBetween(start: Date, end: Date) {
  const dates: Date[] = [];
  const current = startOfDay(start);
  const last = startOfDay(end);
  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
