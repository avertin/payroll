import type { PayrollGrandTotalsDto } from "../dto";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function PayrollGrandTotalsCards({
  grandTotals,
}: {
  grandTotals: PayrollGrandTotalsDto;
}) {
  const {
    uniqueEmployeeCount,
    avgStandardRate,
    avgOvertimeRate,
    avgBenefitsRate,
    cumulativePayrollSpend,
    pctHoursFromApprentices,
    totalHoursOnProject,
  } = grandTotals;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card>
        <CardHeader>
          <CardTitle>Unique employees</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-semibold">{uniqueEmployeeCount}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Avg standard rate</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-semibold">
            {formatCurrency(avgStandardRate)}
          </span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Avg overtime rate</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-semibold">
            {formatCurrency(avgOvertimeRate)}
          </span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Avg benefits rate</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-semibold">
            {formatCurrency(avgBenefitsRate)}
          </span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cumulative payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-semibold">
            {formatCurrency(cumulativePayrollSpend)}
          </span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>% hours (apprentices)</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-semibold">
            {formatPercent(pctHoursFromApprentices)}
          </span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total hours on project</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-semibold">
            {totalHoursOnProject.toFixed(1)}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
