import { randomUUID } from "node:crypto";
import { prisma } from "@/shared/db";
import type { ValidatedEmployee, ValidatedWeeklyWages } from "../dto";
import type { EmployeeLevel } from "@/generated/client";

/**
 * Upsert validated employees and weekly wages into the database.
 * Call only when validation has passed (no errors).
 * Returns the number of weekly wage rows added/updated.
 */
export async function uploadPayrollCsv(result: {
  employees: ValidatedEmployee[];
  weeklyWages: ValidatedWeeklyWages[];
}): Promise<number> {
  const { employees, weeklyWages } = result;

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

  return weeklyWages.length;
}
