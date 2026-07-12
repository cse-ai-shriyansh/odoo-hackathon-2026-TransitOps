export function addDays(baseDate: Date, days: number): Date {
  return new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
}

export function addHours(baseDate: Date, hours: number): Date {
  return new Date(baseDate.getTime() + hours * 60 * 60 * 1000);
}

export function subDays(baseDate: Date, days: number): Date {
  return addDays(baseDate, -days);
}
