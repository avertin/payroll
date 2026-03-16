import { prisma } from "@/shared/db";
import type {
  PayrollReportDto,
  PayrollRowDto,
  PayrollGrandTotalsDto,
  PayrollByEmployeeReportDto,
  PayrollByEmployeeRowDto,
  PayrollByEmployeeGrandTotalsDto,
  PayrollByEmployeeWeekDto,
} from "../dto";

const ST_KEYS = [
  "monStHours",
  "tueStHours",
  "wedStHours",
  "thuStHours",
  "friStHours",
  "satStHours",
  "sunStHours",
] as const;

const OT_KEYS = [
  "monOtHours",
  "tueOtHours",
  "wedOtHours",
  "thuOtHours",
  "friOtHours",
  "satOtHours",
  "sunOtHours",
] as const;

function sumHours(
  row: {
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
  },
  keys: readonly string[]
): number {
  return keys.reduce(
    (acc, key) => acc + (row[key as keyof typeof row] ?? 0),
    0
  );
}

export async function getPayrollReport(): Promise<PayrollReportDto> {
  const wages = await prisma.weeklyWages.findMany({
    include: { employee: true },
    orderBy: [{ weekEnding: "asc" }, { employeeId: "asc" }],
  });

  const rows: PayrollRowDto[] = wages.map((w) => {
    const totalStHrs = sumHours(w, ST_KEYS);
    const totalOtHrs = sumHours(w, OT_KEYS);
    const totalStWage = totalStHrs * w.standardRate;
    const totalOtWage = totalOtHrs * w.overtimeRate;
    const totalWage = totalStWage + totalOtWage;
    return {
      id: w.id,
      employeeId: w.employeeId,
      employeeName: w.employee.name,
      occupation: w.employee.occupation,
      level: w.employee.level as "APPRENTICE" | "JOURNEYWORKER",
      weekEnding: w.weekEnding.toISOString(),
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
      totalStHrs,
      totalOtHrs,
      totalStWage,
      totalOtWage,
      totalWage,
    };
  });

  const uniqueEmployeeIds = new Set(rows.map((r) => r.employeeId));
  const n = rows.length;
  const avgStandardRate =
    n === 0 ? 0 : rows.reduce((a, r) => a + r.standardRate, 0) / n;
  const avgOvertimeRate =
    n === 0 ? 0 : rows.reduce((a, r) => a + r.overtimeRate, 0) / n;
  const avgBenefitsRate =
    n === 0 ? 0 : rows.reduce((a, r) => a + r.benefitsRate, 0) / n;
  const cumulativePayrollSpend = rows.reduce((a, r) => a + r.totalWage, 0);

  let totalHoursAll = 0;
  let totalHoursApprentices = 0;
  for (const r of rows) {
    const hrs = r.totalStHrs + r.totalOtHrs;
    totalHoursAll += hrs;
    if (r.level === "APPRENTICE") totalHoursApprentices += hrs;
  }
  const pctHoursFromApprentices =
    totalHoursAll === 0 ? 0 : (totalHoursApprentices / totalHoursAll) * 100;

  const grandTotals: PayrollGrandTotalsDto = {
    uniqueEmployeeCount: uniqueEmployeeIds.size,
    avgStandardRate,
    avgOvertimeRate,
    avgBenefitsRate,
    cumulativePayrollSpend,
    pctHoursFromApprentices,
  };

  return { rows, grandTotals };
}
