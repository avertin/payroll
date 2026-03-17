"use client";

import * as React from "react";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/table";
import { Button } from "@/shared/components/button";
import type { PayrollReportDto, PayrollByEmployeeReportDto } from "../dto";
import { PayrollSummaryCards } from "./PayrollSummaryCards";
import { PayrollTable as AllPayrollTable } from "./PayrollTable";
import { PayrollByEmployeeTable } from "./PayrollByEmployeeTable";
import { UploadIcon } from "lucide-react";

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

  const isEmpty = reportAll && reportAll.rows.length === 0;

  if (isEmpty) {
    return (
      <div className="container mx-auto space-y-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Payroll report</h1>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Occupation</TableHead>
                <TableHead>Week ending</TableHead>
                <TableHead>ST hrs</TableHead>
                <TableHead>OT hrs</TableHead>
                <TableHead>ST wage</TableHead>
                <TableHead>OT wage</TableHead>
                <TableHead>Total wage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-48 flex flex-col items-center justify-center gap-4 text-center text-muted-foreground"
                >
                  <p className="text-sm font-medium">No payroll data yet</p>
                  <Button
                    render={<Link href="/payroll/upload" />}
                    className="gap-2"
                  >
                    <UploadIcon className="size-4" />
                    Upload payroll data
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Payroll report</h1>
        <Link
          href="/payroll/upload"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
        >
          <UploadIcon className="size-4" />
          Upload payroll
        </Link>
      </div>

      {reportAll && reportByEmployee && (
        <PayrollSummaryCards
          grandTotalsAll={reportAll.grandTotals}
          grandTotalsByEmployee={reportByEmployee.grandTotals}
        />
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="byEmployee">By Employee</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {reportAll && (
            <AllPayrollTable rows={reportAll.rows} groupByNoneOnly />
          )}
        </TabsContent>

        <TabsContent value="byEmployee" className="mt-6">
          {reportByEmployee && (
            <PayrollByEmployeeTable rows={reportByEmployee.rows} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
