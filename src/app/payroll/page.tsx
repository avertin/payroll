import { getPayrollReport } from "@/features/payroll/api";
import {
  PayrollGrandTotalsCards,
  PayrollTable,
} from "@/features/payroll/components";

export default async function PayrollPage() {
  const report = await getPayrollReport();
  return (
    <div className="container mx-auto space-y-8 py-8">
      <h1 className="text-2xl font-semibold">Payroll report</h1>
      <PayrollGrandTotalsCards grandTotals={report.grandTotals} />
      <PayrollTable rows={report.rows} />
    </div>
  );
}
