import {
  getPayrollReport,
  getPayrollReportByEmployee,
} from "@/features/payroll/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? "all";

  if (view === "byEmployee") {
    const report = await getPayrollReportByEmployee();
    return Response.json(report);
  }

  const report = await getPayrollReport();
  return Response.json(report);
}
