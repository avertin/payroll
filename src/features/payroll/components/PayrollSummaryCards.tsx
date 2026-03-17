import type {
  PayrollGrandTotalsDto,
  PayrollByEmployeeGrandTotalsDto,
} from "../dto";
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

const cardClass = "min-w-0 min-h-[7.5rem] flex flex-col";

export function PayrollSummaryCards({
  grandTotalsAll,
  grandTotalsByEmployee,
}: {
  grandTotalsAll: PayrollGrandTotalsDto;
  grandTotalsByEmployee: PayrollByEmployeeGrandTotalsDto;
}) {
  const a = grandTotalsAll;
  const b = grandTotalsByEmployee;

  return (
    <div className="space-y-4">
      {/* Top row: single-value cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Unique employees
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-end">
            <span className="text-2xl font-semibold">
              {a.uniqueEmployeeCount}
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
              {formatCurrency(a.cumulativePayrollSpend)}
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
              {formatPercent(a.pctHoursFromApprentices)}
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
              {a.totalHoursOnProject.toFixed(1)}
            </span>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Employees with wage rate changes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <span className="text-2xl font-semibold">
              {b.employeesWithRateChanges}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              ST, OT, or benefits rate varied across weeks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: min/max/avg cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hours per day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm flex-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min</span>
              <span className="font-medium">{b.hoursPerDayMin.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">{b.hoursPerDayMax.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">{b.hoursPerDayAvg.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Hours per week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm flex-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min</span>
              <span className="font-medium">
                {b.hoursPerWeekMin.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">
                {b.hoursPerWeekMax.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">
                {b.hoursPerWeekAvg.toFixed(1)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Standard rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm flex-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min</span>
              <span className="font-medium">
                {formatCurrency(a.standardRateMin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">
                {formatCurrency(a.standardRateMax)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">
                {formatCurrency(a.avgStandardRate)}
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
                {formatCurrency(a.overtimeRateMin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">
                {formatCurrency(a.overtimeRateMax)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">
                {formatCurrency(a.avgOvertimeRate)}
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
                {formatCurrency(a.benefitsRateMin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">
                {formatCurrency(a.benefitsRateMax)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">
                {formatCurrency(a.avgBenefitsRate)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">% OT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm flex-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min</span>
              <span className="font-medium">{formatPercent(b.pctOtMin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">{formatPercent(b.pctOtMax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">{formatPercent(b.pctOtAvg)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
