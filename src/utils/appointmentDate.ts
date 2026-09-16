const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/**
 * Best-effort parse of the free-text "date" ("Mon, 22 Sep") and "time"
 * ("10:30 AM") fields caretakers type into the appointment form, so the
 * doctor's patient list can be sorted chronologically. Anything that doesn't
 * match the expected shape sorts to the end rather than throwing.
 */
export function parseAppointmentDateTime(date: string, time: string): number {
  const dateMatch = date.match(/(\d{1,2})\s+([A-Za-z]{3})/);
  const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*([AaPp][Mm])/);
  if (!dateMatch || !timeMatch) {
    return Number.POSITIVE_INFINITY;
  }

  const month = MONTHS[dateMatch[2].toLowerCase()];
  if (month === undefined) {
    return Number.POSITIVE_INFINITY;
  }

  const day = parseInt(dateMatch[1], 10);
  let hour = parseInt(timeMatch[1], 10) % 12;
  if (/pm/i.test(timeMatch[3])) {
    hour += 12;
  }
  const minute = parseInt(timeMatch[2], 10);
  const year = new Date().getFullYear();

  return new Date(year, month, day, hour, minute).getTime();
}
