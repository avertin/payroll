import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { prisma } from "../../src/shared/db";
import {
  parsePayrollCsv,
  validatePayroll,
} from "../../src/features/payroll/api";
import { EmployeeLevel } from "../../src/generated/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface SeedPayrollOptions {
  /** When true, log validation errors but do not fail the seed; only valid rows are inserted. */
  bypassValidation?: boolean;
}

export async function seedPayroll(
  options: SeedPayrollOptions = {}
): Promise<void> {
  const { bypassValidation = false } = options;

  const csvPath = path.join(__dirname, "payroll_data.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  const rows = parsePayrollCsv(csvContent);
  const { employees, weeklyWages, errors } = validatePayroll(rows);

  if (errors.length > 0) {
    if (bypassValidation) {
      console.warn(
        `Payroll validation reported ${errors.length} error(s); bypassing (only valid rows will be inserted):`
      );
      for (const e of errors) {
        console.warn(`  Row ${e.rowIndex}: ${e.message}`);
      }
    } else {
      console.error("Payroll validation failed:");
      for (const e of errors) {
        console.error(`  Row ${e.rowIndex}: ${e.message}`);
      }
      process.exit(1);
    }
  }

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { id: emp.id },
      create: {
        id: emp.id,
        name: emp.name,
        occupation: emp.occupation,
        level: emp.level as EmployeeLevel,
      },
      update: {
        name: emp.name,
        occupation: emp.occupation,
        level: emp.level as EmployeeLevel,
      },
    });
  }

  for (const w of weeklyWages) {
    await prisma.weeklyWages.upsert({
      where: {
        employeeId_weekEnding: {
          employeeId: w.employeeId,
          weekEnding: w.weekEnding,
        },
      },
      create: {
        id: randomUUID(),
        employeeId: w.employeeId,
        weekEnding: w.weekEnding,
        monStHours: w.monStHours,
        tueStHours: w.tueStHours,
        wedStHours: w.wedStHours,
        thuStHours: w.thuStHours,
        friStHours: w.friStHours,
        satStHours: w.satStHours,
        sunStHours: w.sunStHours,
        monOtHours: w.monOtHours,
        tueOtHours: w.tueOtHours,
        wedOtHours: w.wedOtHours,
        thuOtHours: w.thuOtHours,
        friOtHours: w.friOtHours,
        satOtHours: w.satOtHours,
        sunOtHours: w.sunOtHours,
        standardRate: w.standardRate,
        overtimeRate: w.overtimeRate,
        benefitsRate: w.benefitsRate,
      },
      update: {
        monStHours: w.monStHours,
        tueStHours: w.tueStHours,
        wedStHours: w.wedStHours,
        thuStHours: w.thuStHours,
        friStHours: w.friStHours,
        satStHours: w.satStHours,
        sunStHours: w.sunStHours,
        monOtHours: w.monOtHours,
        tueOtHours: w.tueOtHours,
        wedOtHours: w.wedOtHours,
        thuOtHours: w.thuOtHours,
        friOtHours: w.friOtHours,
        satOtHours: w.satOtHours,
        sunOtHours: w.sunOtHours,
        standardRate: w.standardRate,
        overtimeRate: w.overtimeRate,
        benefitsRate: w.benefitsRate,
      },
    });
  }
}
