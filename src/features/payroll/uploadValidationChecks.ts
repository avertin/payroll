/**
 * Expected CSV column headers in exact order. Used for validation and UI.
 */
export const EXPECTED_PAYROLL_CSV_HEADERS = [
  "employee_name",
  "employee_id",
  "level",
  "occupation",
  "week_ending",
  "mon_st_hours",
  "tue_st_hours",
  "wed_st_hours",
  "thu_st_hours",
  "fri_st_hours",
  "sat_st_hours",
  "sun_st_hours",
  "mon_ot_hours",
  "tue_ot_hours",
  "wed_ot_hours",
  "thu_ot_hours",
  "fri_ot_hours",
  "sat_ot_hours",
  "sun_ot_hours",
  "standard_rate",
  "overtime_rate",
  "benefits_rate",
] as const;

/**
 * Human-readable list of validation checks shown to the user before upload.
 */
export const PAYROLL_UPLOAD_VALIDATION_CHECKS = [
  "Headers must exactly match the required column names (see below).",
  "employee_id: non-negative integer.",
  "Level must be APPRENTICE or JOURNEYWORKER.",
  "Same employee_id must have consistent name, occupation, and level across all rows.",
  "week_ending: valid date (MM/DD/YYYY).",
  "All hour columns: non-negative numbers.",
  "Standard hours: no more than 8 in a single day; sum per week must be ≤ 40.",
  "Total hours (standard + overtime) in a single day: no more than 24.",
  "overtime_rate must equal 1.5 × standard_rate (within rounding tolerance).",
  "No duplicate rows (same employee_id and week_ending).",
  "If any row fails validation, no data from the file is added.",
] as const;
