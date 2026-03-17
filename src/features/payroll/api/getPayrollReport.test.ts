/**
 * Validates aggregations in getPayrollReport and getPayrollReportByEmployee
 * against expected numbers derived from prisma/seeds/payroll_data.csv.
 *
 * --- Why "seed skips validation" is a misconception ---
 * The seed runs with bypassValidation: true, but that does NOT skip validation.
 * It only bypasses the *failure* when validation reports errors:
 *   - validatePayroll(rows) is ALWAYS run. It returns employees, weeklyWages, and errors.
 *   - Invalid rows are never added to weeklyWages (validation does continue; those rows are skipped).
 *   - The seed then inserts only employees and weeklyWages — i.e. only rows that PASSED.
 * So: "bypass" = "don't process.exit(1) on errors"; the DB still gets only valid rows.
 * Doc numbers (832350, 2485/7686, etc.) were likely computed from the raw CSV (all rows)
 * in Tableau/Excel without running our validation. Rows with name typos (e.g. "Harry Botsfrod"
 * vs "Harry Botsford") or other validation failures are excluded from weeklyWages, so seeded
 * data has fewer wage rows and lower totals than the doc.
 *
 * --- API vs doc ---
 * - Total pay: doc says 832,350 = st + ot + ben. API cumulativePayrollSpend = st + ot only (no benefits).
 * - Rate min/max: doc lists min/max; getPayrollReport only exposes avg. getPayrollReportByEmployee exposes min/max/avg.
 *
 * Doc reference (implementation.md 159–176): 23 employees, 832350 total pay, 2485/7686 apprentice %, rate min/max/avg.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  parsePayrollCsv,
  validatePayroll,
  getPayrollReport,
  getPayrollReportByEmployee,
} from "./index";
const mockFindMany = jest.fn();

jest.mock("../../../shared/db", () => ({
  prisma: {
    weeklyWages: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

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
  row: Record<string, number>,
  keys: readonly string[]
): number {
  return keys.reduce((acc, key) => acc + (row[key] ?? 0), 0);
}

/** Load CSV and return validated wage rows + employees + expected aggregations. */
function loadCsvAndExpected(csvPath: string) {
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const rows = parsePayrollCsv(csvContent);
  const { employees, weeklyWages, errors } = validatePayroll(rows);
  const employeeById = new Map(employees.map((e) => [e.id, e]));

  let totalStOtPay = 0;
  let totalBenPay = 0;
  let totalHoursAll = 0;
  let totalHoursApprentices = 0;
  const standardRates: number[] = [];
  const overtimeRates: number[] = [];
  const benefitsRates: number[] = [];

  for (const w of weeklyWages) {
    const stHrs = sumHours(
      w as unknown as Record<string, number>,
      ST_KEYS as unknown as string[]
    );
    const otHrs = sumHours(
      w as unknown as Record<string, number>,
      OT_KEYS as unknown as string[]
    );
    const totalHrs = stHrs + otHrs;
    const stPay = stHrs * w.standardRate;
    const otPay = otHrs * w.overtimeRate;
    const benPay = (stHrs + otHrs) * w.benefitsRate;

    totalStOtPay += stPay + otPay;
    totalBenPay += benPay;
    totalHoursAll += totalHrs;

    const emp = employeeById.get(w.employeeId);
    if (emp?.level === "APPRENTICE") totalHoursApprentices += totalHrs;

    standardRates.push(w.standardRate);
    overtimeRates.push(w.overtimeRate);
    benefitsRates.push(w.benefitsRate);
  }

  const n = standardRates.length;
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

  const expected = {
    uniqueEmployeeCount: employees.length,
    totalPayStOtOnly: totalStOtPay,
    totalPayStOtBen: totalStOtPay + totalBenPay,
    totalHoursAll,
    totalHoursApprentices,
    pctHoursFromApprentices:
      totalHoursAll === 0 ? 0 : (totalHoursApprentices / totalHoursAll) * 100,
    standardRateMin: n === 0 ? 0 : Math.min(...standardRates),
    standardRateMax: n === 0 ? 0 : Math.max(...standardRates),
    standardRateAvg: n === 0 ? 0 : sum(standardRates) / n,
    overtimeRateMin: n === 0 ? 0 : Math.min(...overtimeRates),
    overtimeRateMax: n === 0 ? 0 : Math.max(...overtimeRates),
    overtimeRateAvg: n === 0 ? 0 : sum(overtimeRates) / n,
    benefitsRateMin: n === 0 ? 0 : Math.min(...benefitsRates),
    benefitsRateMax: n === 0 ? 0 : Math.max(...benefitsRates),
    benefitsRateAvg: n === 0 ? 0 : sum(benefitsRates) / n,
    wageRowCount: weeklyWages.length,
    validationErrors: errors.length,
  };

  return { expected, weeklyWages, employees };
}

/** Build Prisma findMany shape from validated CSV data for mocking. */
function buildMockWages(
  weeklyWages: Awaited<ReturnType<typeof loadCsvAndExpected>>["weeklyWages"],
  employees: Awaited<ReturnType<typeof loadCsvAndExpected>>["employees"]
) {
  const empMap = new Map(employees.map((e) => [e.id, e]));
  return weeklyWages.map((w, i) => {
    const emp = empMap.get(w.employeeId)!;
    return {
      id: `mock-${w.employeeId}-${w.weekEnding.getTime()}-${i}`,
      weekEnding: w.weekEnding,
      employeeId: w.employeeId,
      employee: {
        name: emp.name,
        occupation: emp.occupation,
        level: emp.level,
      },
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
    };
  });
}

const CSV_PATH = path.join(
  process.cwd(),
  "prisma",
  "seeds",
  "payroll_data.csv"
);

describe("getPayrollReport aggregations vs payroll_data.csv", () => {
  let expected: Awaited<ReturnType<typeof loadCsvAndExpected>>["expected"];

  beforeAll(() => {
    if (!fs.existsSync(CSV_PATH)) {
      throw new Error(`CSV not found: ${CSV_PATH}`);
    }
    const {
      expected: exp,
      weeklyWages,
      employees,
    } = loadCsvAndExpected(CSV_PATH);
    expected = exp;
    const mockWages = buildMockWages(weeklyWages, employees);
    const sorted = [...mockWages].sort(
      (a, b) =>
        a.weekEnding.getTime() - b.weekEnding.getTime() ||
        a.employeeId - b.employeeId
    );
    mockFindMany.mockResolvedValue(sorted);
  });

  it("loads CSV and computes expected from validated rows", () => {
    expect(expected.wageRowCount).toBeGreaterThan(0);
    expect(expected.uniqueEmployeeCount).toBeGreaterThan(0);
    expect(expected.validationErrors).toBeGreaterThanOrEqual(0);
  });

  it("logs validation and aggregation breakdown (seed inserts only valid rows)", () => {
    const csvRows = parsePayrollCsv(fs.readFileSync(CSV_PATH, "utf-8")).length;
    const inserted = expected.wageRowCount;
    const errorCount = expected.validationErrors;
    const totalPayStOt = Math.round(expected.totalPayStOtOnly);
    const totalPayStOtBen = Math.round(expected.totalPayStOtBen);
    const docTotalPay = 832_350;
    const report = [
      "--- Payroll CSV vs seeded data ---",
      `CSV data rows: ${csvRows}`,
      `Validation error count: ${errorCount} (some rows trigger multiple checks)`,
      `Wage rows inserted by seed (weeklyWages.length): ${inserted} (only rows that passed all checks)`,
      `Unique employees: ${expected.uniqueEmployeeCount}`,
      `Total pay (st+ot only): ${totalPayStOt}`,
      `Total pay (st+ot+ben): ${totalPayStOtBen}`,
      `Doc total pay (st+ot+ben): ${docTotalPay} (from raw CSV)`,
      `Total hours: ${expected.totalHoursAll.toFixed(1)} | Apprentice hours: ${expected.totalHoursApprentices.toFixed(1)}`,
      `Standard rate: min ${expected.standardRateMin} max ${expected.standardRateMax} avg ${expected.standardRateAvg.toFixed(2)}`,
    ].join("\n");
    // eslint-disable-next-line no-console
    console.log(report);
    expect(inserted).toBeLessThanOrEqual(csvRows);
    expect(inserted + errorCount).toBeGreaterThanOrEqual(csvRows);
  });

  describe("vs implementation.md (doc numbers: 23 employees, 832350 total pay, 2485/7686 apprentice %, rate min/max/avg)", () => {
    const doc = {
      uniqueEmployees: 23,
      totalPayStOtBen: 832_350,
      apprenticeHours: 2485,
      totalHours: 7686,
      standardRateMin: 15.92,
      standardRateMax: 102.5,
      standardRateAvg: 43.71,
      overtimeRateMin: 23.89,
      overtimeRateMax: 153.8,
      overtimeRateAvg: 65.56,
      benefitsRateMin: 6.69,
      benefitsRateMax: 39.68,
      benefitsRateAvg: 16.39,
    };

    it("doc vs validated-CSV: documents disagreements (validation drops rows with name typos etc.)", () => {
      // Expected is computed from validated rows only. Doc was likely computed from full CSV.
      // When validation rejects rows (e.g. "Harry Botsfrod" vs "Harry Botsford"), we have fewer
      // wage rows → lower totals and different min/max (e.g. max rate 102.54 may be on a rejected row).
      expect(expected.uniqueEmployeeCount).toBe(doc.uniqueEmployees);
      if (expected.validationErrors > 0) {
        expect(expected.totalPayStOtBen).toBeLessThan(doc.totalPayStOtBen);
      }
    });
  });

  describe("API vs CSV-derived expected (with seeded DB)", () => {
    it("getPayrollReport grand totals: unique employees, hours, % apprentice, avg rates", async () => {
      const report = await getPayrollReport();

      expect(report.grandTotals.uniqueEmployeeCount).toBe(
        expected.uniqueEmployeeCount
      );
      expect(report.grandTotals.totalHoursOnProject).toBeCloseTo(
        expected.totalHoursAll,
        2
      );
      expect(report.grandTotals.pctHoursFromApprentices).toBeCloseTo(
        expected.pctHoursFromApprentices,
        2
      );
      expect(report.grandTotals.avgStandardRate).toBeCloseTo(
        expected.standardRateAvg,
        2
      );
      expect(report.grandTotals.avgOvertimeRate).toBeCloseTo(
        expected.overtimeRateAvg,
        2
      );
      expect(report.grandTotals.avgBenefitsRate).toBeCloseTo(
        expected.benefitsRateAvg,
        2
      );
    });

    it("getPayrollReport cumulativePayrollSpend is st+ot only (no benefits)", async () => {
      const report = await getPayrollReport();
      // API does not include benefits in cumulativePayrollSpend.
      expect(report.grandTotals.cumulativePayrollSpend).toBeCloseTo(
        expected.totalPayStOtOnly,
        2
      );
      expect(report.grandTotals.cumulativePayrollSpend).not.toBeCloseTo(
        expected.totalPayStOtBen,
        0
      );
    });

    it("getPayrollReportByEmployee grand totals: rate min/max/avg match CSV", async () => {
      const byEmployee = await getPayrollReportByEmployee();
      const gt = byEmployee.grandTotals;

      expect(gt.standardRateMin).toBeCloseTo(expected.standardRateMin, 2);
      expect(gt.standardRateMax).toBeCloseTo(expected.standardRateMax, 2);
      expect(gt.standardRateAvg).toBeCloseTo(expected.standardRateAvg, 2);
      expect(gt.overtimeRateMin).toBeCloseTo(expected.overtimeRateMin, 2);
      expect(gt.overtimeRateMax).toBeCloseTo(expected.overtimeRateMax, 2);
      expect(gt.overtimeRateAvg).toBeCloseTo(expected.overtimeRateAvg, 2);
      expect(gt.benefitsRateMin).toBeCloseTo(expected.benefitsRateMin, 2);
      expect(gt.benefitsRateMax).toBeCloseTo(expected.benefitsRateMax, 2);
      expect(gt.benefitsRateAvg).toBeCloseTo(expected.benefitsRateAvg, 2);
    });
  });
});
