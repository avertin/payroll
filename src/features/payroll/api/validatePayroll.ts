import type {
  ParsedPayrollRow,
  ValidatedEmployee,
  ValidatedWeeklyWages,
  EmployeeLevel,
} from "../dto";
import { EXPECTED_PAYROLL_CSV_HEADERS } from "../uploadValidationChecks";

const LEVELS: EmployeeLevel[] = ["APPRENTICE", "JOURNEYWORKER"];
const OT_MULTIPLIER = 1.5;
/** Tolerance for overtime = 1.5 * standard (CSV uses rounded rates). */
const FLOAT_TOLERANCE = 0.02;
const MAX_ST_HOURS_PER_WEEK = 40;
const MAX_ST_HOURS_PER_DAY = 8;
const MAX_TOTAL_HOURS_PER_DAY = 24;

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const ST_HOUR_KEYS = [
  "mon_st_hours",
  "tue_st_hours",
  "wed_st_hours",
  "thu_st_hours",
  "fri_st_hours",
  "sat_st_hours",
  "sun_st_hours",
] as const;

const OT_HOUR_KEYS = [
  "mon_ot_hours",
  "tue_ot_hours",
  "wed_ot_hours",
  "thu_ot_hours",
  "fri_ot_hours",
  "sat_ot_hours",
  "sun_ot_hours",
] as const;

export interface ValidationError {
  rowIndex: number;
  message: string;
}

export interface ValidationResult {
  employees: ValidatedEmployee[];
  weeklyWages: ValidatedWeeklyWages[];
  errors: ValidationError[];
}

function parseWeekEnding(value: string): Date {
  const [month, day, year] = value.split("/").map(Number);
  const date = new Date(year!, month! - 1, day!);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
}

function parseFloatOrFail(value: string, label: string): number {
  const n = Number(value);
  if (Number.isNaN(n)) {
    throw new Error(`${label} is not a number: ${value}`);
  }
  return n;
}

/**
 * Validate all rows: employee consistency (name + employee_id), level enum,
 * hours >= 0, ST sum <= 40, overtime rate = 1.5 * standard rate.
 * Returns validated employees (deduplicated) and weekly wages, or errors.
 */
export function validatePayroll(rows: ParsedPayrollRow[]): ValidationResult {
  const errors: ValidationError[] = [];
  const employeeById = new Map<number, ValidatedEmployee>();
  const weeklyWages: ValidatedWeeklyWages[] = [];
  const seenWageKeys = new Set<string>();

  if (rows.length > 0) {
    const actualHeaders = Object.keys(rows[0]!);
    const expectedSet = new Set<string>(EXPECTED_PAYROLL_CSV_HEADERS);
    const actualSet = new Set(actualHeaders);
    const missing = EXPECTED_PAYROLL_CSV_HEADERS.filter(
      (h) => !actualSet.has(h)
    );
    const extra = actualHeaders.filter((h: string) => !expectedSet.has(h));
    if (missing.length > 0) {
      errors.push({
        rowIndex: 1,
        message: `Header row: missing required column(s): ${missing.join(", ")}`,
      });
    }
    if (extra.length > 0) {
      errors.push({
        rowIndex: 1,
        message: `Header row: unexpected column(s): ${extra.join(", ")}`,
      });
    }
    if (errors.length > 0) {
      return {
        employees: [],
        weeklyWages: [],
        errors,
      };
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const rowIndex = i + 2; // 1-based + header

    try {
      const employeeId = parseFloatOrFail(
        row["employee_id"] ?? "",
        "employee_id"
      );
      if (!Number.isInteger(employeeId) || employeeId < 0) {
        errors.push({
          rowIndex,
          message: `employee_id must be a non-negative integer: ${row["employee_id"]}`,
        });
        continue;
      }

      const name = (row["employee_name"] ?? "").trim();
      const occupation = (row["occupation"] ?? "").trim();
      const levelRaw = (row["level"] ?? "").trim().toUpperCase();
      if (!LEVELS.includes(levelRaw as EmployeeLevel)) {
        errors.push({
          rowIndex,
          message: `level must be APPRENTICE or JOURNEYWORKER: ${row["level"]}`,
        });
        continue;
      }
      const level = levelRaw as EmployeeLevel;

      const existing = employeeById.get(employeeId);
      if (existing) {
        if (
          existing.name !== name ||
          existing.occupation !== occupation ||
          existing.level !== level
        ) {
          errors.push({
            rowIndex,
            message: `Employee ${employeeId} has inconsistent name/occupation/level across rows (expected name=${existing.name}, occupation=${existing.occupation}, level=${existing.level})`,
          });
          continue;
        }
      } else {
        employeeById.set(employeeId, {
          id: employeeId,
          name,
          occupation,
          level,
        });
      }

      const weekEndingStr = row["week_ending"] ?? "";
      let weekEnding: Date;
      try {
        weekEnding = parseWeekEnding(weekEndingStr);
      } catch {
        errors.push({
          rowIndex,
          message: `Invalid week_ending: ${weekEndingStr}`,
        });
        continue;
      }

      const stHours: number[] = [];
      for (const key of ST_HOUR_KEYS) {
        const v = parseFloatOrFail(row[key] ?? "0", key);
        if (v < 0) {
          errors.push({
            rowIndex,
            message: `Hours cannot be negative: ${key}=${v}`,
          });
          break;
        }
        stHours.push(v);
      }
      if (errors.some((e) => e.rowIndex === rowIndex)) continue;

      const otHours: number[] = [];
      for (const key of OT_HOUR_KEYS) {
        const v = parseFloatOrFail(row[key] ?? "0", key);
        if (v < 0) {
          errors.push({
            rowIndex,
            message: `Hours cannot be negative: ${key}=${v}`,
          });
          break;
        }
        otHours.push(v);
      }
      if (errors.some((e) => e.rowIndex === rowIndex)) continue;

      for (let d = 0; d < 7; d++) {
        if (stHours[d]! > MAX_ST_HOURS_PER_DAY) {
          errors.push({
            rowIndex,
            message: `Standard hours for ${DAY_NAMES[d]} must be <= ${MAX_ST_HOURS_PER_DAY}: ${stHours[d]}`,
          });
        }
      }

      for (let d = 0; d < 7; d++) {
        const totalDay = stHours[d]! + otHours[d]!;
        if (totalDay > MAX_TOTAL_HOURS_PER_DAY) {
          errors.push({
            rowIndex,
            message: `More than ${MAX_TOTAL_HOURS_PER_DAY} hours in a single day for ${DAY_NAMES[d]}: ${totalDay.toFixed(1)}`,
          });
        }
      }

      const stTotal = stHours.reduce((a, b) => a + b, 0);
      if (stTotal > MAX_ST_HOURS_PER_WEEK) {
        errors.push({
          rowIndex,
          message: `Sum of standard hours (${stTotal}) must be <= 40`,
        });
      }

      const standardRate = parseFloatOrFail(
        row["standard_rate"] ?? "",
        "standard_rate"
      );
      const overtimeRate = parseFloatOrFail(
        row["overtime_rate"] ?? "",
        "overtime_rate"
      );
      const benefitsRate = parseFloatOrFail(
        row["benefits_rate"] ?? "",
        "benefits_rate"
      );

      const expectedOt = standardRate * OT_MULTIPLIER;
      if (Math.abs(overtimeRate - expectedOt) >= FLOAT_TOLERANCE) {
        errors.push({
          rowIndex,
          message: `overtime_rate (${overtimeRate}) must be 1.5 * standard_rate (${standardRate}) = ${expectedOt}`,
        });
      }

      const wageKey = `${employeeId},${weekEnding.getTime()}`;
      if (seenWageKeys.has(wageKey)) {
        errors.push({
          rowIndex,
          message: `Duplicate row for employee ${employeeId}, week ending ${weekEndingStr}`,
        });
      }

      if (errors.some((e) => e.rowIndex === rowIndex)) continue;
      seenWageKeys.add(wageKey);

      weeklyWages.push({
        employeeId,
        weekEnding,
        monStHours: stHours[0]!,
        tueStHours: stHours[1]!,
        wedStHours: stHours[2]!,
        thuStHours: stHours[3]!,
        friStHours: stHours[4]!,
        satStHours: stHours[5]!,
        sunStHours: stHours[6]!,
        monOtHours: otHours[0]!,
        tueOtHours: otHours[1]!,
        wedOtHours: otHours[2]!,
        thuOtHours: otHours[3]!,
        friOtHours: otHours[4]!,
        satOtHours: otHours[5]!,
        sunOtHours: otHours[6]!,
        standardRate,
        overtimeRate,
        benefitsRate,
      });
    } catch (err) {
      errors.push({
        rowIndex,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    employees: Array.from(employeeById.values()),
    weeklyWages,
    errors,
  };
}
