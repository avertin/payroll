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

// --- Payroll report API (GET /api/payroll) ---

/** One row in the payroll report: wage record + employee + computed totals. Dates as ISO strings for API. */
export interface PayrollRowDto {
  id: string;
  employeeId: number;
  employeeName: string;
  occupation: string;
  level: EmployeeLevel;
  weekEnding: string; // ISO
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
  totalStHrs: number;
  totalOtHrs: number;
  totalStWage: number;
  totalOtWage: number;
  totalWage: number;
}

/** Grand totals for the payroll report (All view). */
export interface PayrollGrandTotalsDto {
  uniqueEmployeeCount: number;
  avgStandardRate: number;
  avgOvertimeRate: number;
  avgBenefitsRate: number;
  cumulativePayrollSpend: number;
  pctHoursFromApprentices: number;
  totalHoursOnProject: number;
}

export interface PayrollReportDto {
  rows: PayrollRowDto[];
  grandTotals: PayrollGrandTotalsDto;
}

// --- By Employee view ---

/** One row in the by-employee report (aggregated per employee). */
export interface PayrollByEmployeeRowDto {
  employeeId: number;
  employeeName: string;
  occupation: string;
  level: EmployeeLevel;
  totalAllTimePay: number;
  totalHours: number;
  avgWeeklyHours: number;
  maxSingleWeekHours: number;
  minSingleWeekHours: number;
  pctOt: number;
  numberOfWeeksWorked: number;
  rateVariance: boolean;
}

/** Grand totals for the by-employee view cards (min/max/avg metrics). */
export interface PayrollByEmployeeGrandTotalsDto {
  hoursPerDayMin: number;
  hoursPerDayMax: number;
  hoursPerDayAvg: number;
  standardRateMin: number;
  standardRateMax: number;
  standardRateAvg: number;
  overtimeRateMin: number;
  overtimeRateMax: number;
  overtimeRateAvg: number;
  benefitsRateMin: number;
  benefitsRateMax: number;
  benefitsRateAvg: number;
  pctOtMin: number;
  pctOtMax: number;
  pctOtAvg: number;
}

export interface PayrollByEmployeeReportDto {
  rows: PayrollByEmployeeRowDto[];
  grandTotals: PayrollByEmployeeGrandTotalsDto;
}
