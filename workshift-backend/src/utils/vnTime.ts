/** Biên ngày theo múi Asia/Ho_Chi_Minh (+07), tương thích logic Java `atStartOfDay(ZoneId)`. */
export function vnStartOfCalendarDay(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00+07:00`);
}

export function vnMonthRange(year: number, month: number): { start: Date; end: Date } {
  const firstStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const start = vnStartOfCalendarDay(firstStr);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextFirstStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  const end = vnStartOfCalendarDay(nextFirstStr);
  return { start, end };
}
