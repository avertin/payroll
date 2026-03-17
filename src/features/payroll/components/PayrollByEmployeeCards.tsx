import type { PayrollByEmployeeGrandTotalsDto } from "../dto";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";

function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function PayrollByEmployeeCards({
  grandTotals,
}: {
  grandTotals: PayrollByEmployeeGrandTotalsDto;
}) {
  const {
    hoursPerDayMin,
    hoursPerDayMax,
    hoursPerDayAvg,
    hoursPerWeekMin,
    hoursPerWeekMax,
    hoursPerWeekAvg,
    pctOtMin,
    pctOtMax,
    pctOtAvg,
    employeesWithRateChanges,
  } = grandTotals;

  const cardClass = "min-w-0 min-h-[7.5rem] flex flex-col";
  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Employees with wage rate changes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end">
            <span className="text-2xl font-semibold">
              {employeesWithRateChanges}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              ST, OT, or benefits rate varied across weeks
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className={cardClass}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hours per day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm flex-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min</span>
              <span className="font-medium">{hoursPerDayMin.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">{hoursPerDayMax.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">{hoursPerDayAvg.toFixed(1)}</span>
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
              <span className="font-medium">{hoursPerWeekMin.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">{hoursPerWeekMax.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">{hoursPerWeekAvg.toFixed(1)}</span>
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
              <span className="font-medium">{formatPercent(pctOtMin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max</span>
              <span className="font-medium">{formatPercent(pctOtMax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-medium">{formatPercent(pctOtAvg)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
