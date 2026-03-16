/**
 * Raw row as parsed from CSV (all string values).
 * Column names match CSV headers: employee_name, employee_id, level, occupation,
 * week_ending, mon_st_hours ... sun_st_hours, mon_ot_hours ... sun_ot_hours,
 * standard_rate, overtime_rate, benefits_rate.
 */
export type ParsedPayrollRow = Record<string, string>;

export type EmployeeLevel = "APPRENTICE" | "JOURNEYWORKER";

/** Validated employee data (e.g. deduplicated by employee_id). */
export interface ValidatedEmployee {
  id: number;
  name: string;
  occupation: string;
  level: EmployeeLevel;
}

/** Validated weekly wages row (numbers and date). */
export interface ValidatedWeeklyWages {
  employeeId: number;
  weekEnding: Date;
  monStHours: number;
  tueStHours: number;
  wedStHours: number;
  thuStHours: number;
  friStHours: number;
  satStHours: number;
  sunStHours: number;
  monOtHours: number;
  tueOtHours: number;
  wedOtHours: number;
  thuOtHours: number;
  friOtHours: number;
  satOtHours: number;
  sunOtHours: number;
  standardRate: number;
  overtimeRate: number;
  benefitsRate: number;
}
