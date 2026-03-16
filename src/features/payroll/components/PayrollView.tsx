"use client";

import * as React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/tabs";
import type { PayrollReportDto, PayrollByEmployeeReportDto } from "../dto";
import { PayrollGrandTotalsCards } from "./PayrollGrandTotalsCards";
import { PayrollTable as AllPayrollTable } from "./PayrollTable";
import { PayrollByEmployeeCards } from "./PayrollByEmployeeCards";
import { PayrollByEmployeeTable } from "./PayrollByEmployeeTable";

export function PayrollView() {
  const [reportAll, setReportAll] = React.useState<PayrollReportDto | null>(
    null
  );
  const [reportByEmployee, setReportByEmployee] =
    React.useState<PayrollByEmployeeReportDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("/api/payroll?view=all").then((r) => r.json()),
      fetch("/api/payroll?view=byEmployee").then((r) => r.json()),
    ])
      .then(([allData, byEmployeeData]) => {
        if (cancelled) return;
        setReportAll(allData as PayrollReportDto);
        setReportByEmployee(byEmployeeData as PayrollByEmployeeReportDto);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">Loading payroll data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-destructive">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <h1 className="text-2xl font-semibold">Payroll report</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="byEmployee">By Employee</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {reportAll && (
            <>
              <PayrollGrandTotalsCards grandTotals={reportAll.grandTotals} />
              <AllPayrollTable rows={reportAll.rows} groupByNoneOnly />
            </>
          )}
        </TabsContent>

        <TabsContent value="byEmployee" className="space-y-6">
          {reportByEmployee && (
            <>
              <PayrollByEmployeeCards
                grandTotals={reportByEmployee.grandTotals}
              />
              <PayrollByEmployeeTable rows={reportByEmployee.rows} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
