import { getPayrollReport } from "@/features/payroll/api";

export async function GET() {
  const report = await getPayrollReport();
  return Response.json(report);
}
