/**
 * Default grade teams from the current school year.
 * The school year starts in August: from Aug 2026 to Jul 2027 the seniors are the Class of 2027.
 */

export const GRADE_LABELS = ["Seniors", "Juniors", "Sophomores", "Freshmen"] as const;

export function seniorClassYear(today: Date = new Date()): number {
  const y = today.getFullYear();
  return today.getMonth() >= 7 ? y + 1 : y; // getMonth(): 7 = August
}

export function defaultGradeTeams(today: Date = new Date()) {
  const senior = seniorClassYear(today);
  return GRADE_LABELS.map((label, i) => ({
    name: `Class of ${senior + i}`,
    label,
    classYear: senior + i,
    sortOrder: i,
  }));
}
