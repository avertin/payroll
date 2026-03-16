import { prisma } from "@/shared/db";
import type {
  PayrollReportDto,
  PayrollRowDto,
  PayrollGrandTotalsDto,
  PayrollByEmployeeReportDto,
  PayrollByEmployeeRowDto,
  PayrollByEmployeeGrandTotalsDto,
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
    totalHoursOnProject: totalHoursAll,
  };

  return { rows, grandTotals };
}

export async function getPayrollReportByEmployee(): Promise<PayrollByEmployeeReportDto> {
  const wages = await prisma.weeklyWages.findMany({
    include: { employee: true },
    orderBy: [{ employeeId: "asc" }, { weekEnding: "asc" }],
  });

  const weekRows = wages.map((w) => {
    const totalStHrs = sumHours(w, ST_KEYS);
    const totalOtHrs = sumHours(w, OT_KEYS);
    const totalWage = totalStHrs * w.standardRate + totalOtHrs * w.overtimeRate;
    const totalHrs = totalStHrs + totalOtHrs;
    const hoursPerDay = totalHrs / 7;
    const pctOt = totalHrs === 0 ? 0 : (totalOtHrs / totalHrs) * 100;
    return {
      employeeId: w.employeeId,
      employeeName: w.employee.name,
      occupation: w.employee.occupation,
      level: w.employee.level as "APPRENTICE" | "JOURNEYWORKER",
      weekEnding: w.weekEnding.toISOString(),
      totalStHrs,
      totalOtHrs,
      totalWage,
      totalHrs,
      hoursPerDay,
      standardRate: w.standardRate,
      overtimeRate: w.overtimeRate,
      benefitsRate: w.benefitsRate,
      pctOt,
    };
  });

  // Group by employee
  const byEmployee = new Map<
    number,
    {
      employeeName: string;
      occupation: string;
      level: "APPRENTICE" | "JOURNEYWORKER";
      weeks: Array<{
        weekEnding: string;
        totalStHrs: number;
        totalOtHrs: number;
        totalWage: number;
        totalHrs: number;
        hoursPerDay: number;
        standardRate: number;
        overtimeRate: number;
        benefitsRate: number;
        pctOt: number;
      }>;
    }
  >();

  for (const r of weekRows) {
    let emp = byEmployee.get(r.employeeId);
    if (!emp) {
      emp = {
        employeeName: r.employeeName,
        occupation: r.occupation,
        level: r.level,
        weeks: [],
      };
      byEmployee.set(r.employeeId, emp);
    }
    emp.weeks.push({
      weekEnding: r.weekEnding,
      totalStHrs: r.totalStHrs,
      totalOtHrs: r.totalOtHrs,
      totalWage: r.totalWage,
      totalHrs: r.totalHrs,
      hoursPerDay: r.hoursPerDay,
      standardRate: r.standardRate,
      overtimeRate: r.overtimeRate,
      benefitsRate: r.benefitsRate,
      pctOt: r.pctOt,
    });
  }

  const rows: PayrollByEmployeeRowDto[] = [];
  const allHoursPerDay: number[] = [];
  const allStandardRates: number[] = [];
  const allOvertimeRates: number[] = [];
  const allBenefitsRates: number[] = [];
  const allPctOt: number[] = [];

  for (const [employeeId, emp] of byEmployee) {
    const weeks = emp.weeks;
    const totalAllTimePay = weeks.reduce((a, w) => a + w.totalWage, 0);
    const totalHrsAll = weeks.reduce((a, w) => a + w.totalHrs, 0);
    const avgWeeklyHours = weeks.length === 0 ? 0 : totalHrsAll / weeks.length;
    const weekHours = weeks.map((w) => w.totalHrs);
    const maxSingleWeekHours =
      weekHours.length === 0 ? 0 : Math.max(...weekHours);
    const minSingleWeekHours =
      weekHours.length === 0 ? 0 : Math.min(...weekHours);
    const pctOt =
      totalHrsAll === 0
        ? 0
        : (weeks.reduce((a, w) => a + w.totalOtHrs, 0) / totalHrsAll) * 100;
    const standardRates = [...new Set(weeks.map((w) => w.standardRate))];
    const rateVariance =
      standardRates.length > 1 ||
      new Set(weeks.map((w) => w.overtimeRate)).size > 1;

    for (const w of weeks) {
      allHoursPerDay.push(w.hoursPerDay);
      allStandardRates.push(w.standardRate);
      allOvertimeRates.push(w.overtimeRate);
      allBenefitsRates.push(w.benefitsRate);
      allPctOt.push(w.pctOt);
    }

    rows.push({
      employeeId,
      employeeName: emp.employeeName,
      occupation: emp.occupation,
      level: emp.level,
      totalAllTimePay,
      totalHours: totalHrsAll,
      avgWeeklyHours,
      maxSingleWeekHours,
      minSingleWeekHours,
      pctOt,
      numberOfWeeksWorked: weeks.length,
      rateVariance,
    });
  }

  const n = allHoursPerDay.length;
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  const grandTotals: PayrollByEmployeeGrandTotalsDto = {
    hoursPerDayMin: n === 0 ? 0 : Math.min(...allHoursPerDay),
    hoursPerDayMax: n === 0 ? 0 : Math.max(...allHoursPerDay),
    hoursPerDayAvg: n === 0 ? 0 : sum(allHoursPerDay) / n,
    standardRateMin: n === 0 ? 0 : Math.min(...allStandardRates),
    standardRateMax: n === 0 ? 0 : Math.max(...allStandardRates),
    standardRateAvg: n === 0 ? 0 : sum(allStandardRates) / n,
    overtimeRateMin: n === 0 ? 0 : Math.min(...allOvertimeRates),
    overtimeRateMax: n === 0 ? 0 : Math.max(...allOvertimeRates),
    overtimeRateAvg: n === 0 ? 0 : sum(allOvertimeRates) / n,
    benefitsRateMin: n === 0 ? 0 : Math.min(...allBenefitsRates),
    benefitsRateMax: n === 0 ? 0 : Math.max(...allBenefitsRates),
    benefitsRateAvg: n === 0 ? 0 : sum(allBenefitsRates) / n,
    pctOtMin: n === 0 ? 0 : Math.min(...allPctOt),
    pctOtMax: n === 0 ? 0 : Math.max(...allPctOt),
    pctOtAvg: n === 0 ? 0 : sum(allPctOt) / n,
  };

  return { rows, grandTotals };
}
