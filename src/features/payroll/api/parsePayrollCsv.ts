import { parse } from "csv-parse/sync";
import type { ParsedPayrollRow } from "../dto";

/**
 * Parse CSV content into an array of row objects.
 * Uses first row as headers; no validation — formatting/parsing only.
 */
export function parsePayrollCsv(csvContent: string): ParsedPayrollRow[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];
  return records;
}
