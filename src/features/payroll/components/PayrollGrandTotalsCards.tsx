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
    standardRateMin,
    standardRateMax,
    avgStandardRate,
    overtimeRateMin,
    overtimeRateMax,
    avgOvertimeRate,
    benefitsRateMin,
    benefitsRateMax,
    avgBenefitsRate,
    cumulativePayrollSpend,
    pctHoursFromApprentices,
    totalHoursOnProject,
  } = grandTotals;

  const cardClass = "min-w-0 min-h-[7.5rem] flex flex-col";
  const gridRow1 = "grid gap-4 grid-cols-2 lg:grid-cols-4";
  const gridRow2 = "grid gap-4 grid-cols-1 sm:grid-cols-3";
  return (
    <div className="space-y-4">
      <div className={gridRow1}>
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Unique employees
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <span className="text-2xl font-semibold">
              {uniqueEmployeeCount}
            </span>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Cumulative payroll
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <span className="text-2xl font-semibold">
              {formatCurrency(cumulativePayrollSpend)}
            </span>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              % hours (apprentices)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <span className="text-2xl font-semibold">
              {formatPercent(pctHoursFromApprentices)}
            </span>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total hours on project
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <span className="text-2xl font-semibold">
              {totalHoursOnProject.toFixed(1)}
            </span>
          </CardContent>
        </Card>
      </div>
      <div className={gridRow2}>
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Standard rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm flex-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min</span>
              <span className="font-medium">
                {formatCurrency(standardRateMin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">
                {formatCurrency(standardRateMax)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">
                {formatCurrency(avgStandardRate)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overtime rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm flex-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min</span>
              <span className="font-medium">
                {formatCurrency(overtimeRateMin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">
                {formatCurrency(overtimeRateMax)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">
                {formatCurrency(avgOvertimeRate)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Benefits rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm flex-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min</span>
              <span className="font-medium">
                {formatCurrency(benefitsRateMin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">
                {formatCurrency(benefitsRateMax)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">
                {formatCurrency(avgBenefitsRate)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
