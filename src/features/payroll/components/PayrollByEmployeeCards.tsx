import type { PayrollByEmployeeGrandTotalsDto } from "../dto";
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

export function PayrollByEmployeeCards({
  grandTotals,
}: {
  grandTotals: PayrollByEmployeeGrandTotalsDto;
}) {
  const {
    hoursPerDayMin,
    hoursPerDayMax,
    hoursPerDayAvg,
    standardRateMin,
    standardRateMax,
    standardRateAvg,
    overtimeRateMin,
    overtimeRateMax,
    overtimeRateAvg,
    benefitsRateMin,
    benefitsRateMax,
    benefitsRateAvg,
    pctOtMin,
    pctOtMax,
    pctOtAvg,
  } = grandTotals;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Hours per day</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Standard rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
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
              {formatCurrency(standardRateAvg)}
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Overtime rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
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
              {formatCurrency(overtimeRateAvg)}
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Benefits rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
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
              {formatCurrency(benefitsRateAvg)}
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">% OT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
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
  );
}
