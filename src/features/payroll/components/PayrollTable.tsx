"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type GroupingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { PayrollRowDto } from "../dto";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/table";
import { Input } from "@/shared/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/select";
import { cn } from "@/shared/utils";

type GroupByOption = "none" | "employee" | "week";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildColumns(): ColumnDef<PayrollRowDto>[] {
  return [
    {
      id: "employeeId",
      accessorKey: "employeeId",
      header: "Employee ID",
      enableGrouping: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "employeeName",
      header: "Employee",
      enableGrouping: false,
      cell: (info) => String(info.getValue()),
    },
    {
      accessorKey: "level",
      id: "level",
      header: "Level",
      enableGrouping: false,
      cell: (info) => String(info.getValue()),
    },
    {
      accessorKey: "occupation",
      id: "occupation",
      header: "Occupation",
      enableGrouping: false,
      cell: (info) => String(info.getValue()),
    },
    {
      accessorKey: "weekEnding",
      header: "Week ending",
      enableGrouping: true,
      cell: (info) => formatDate(String(info.getValue())),
    },
    {
      accessorKey: "totalStHrs",
      header: "ST hrs",
      cell: (info) => (info.getValue() as number).toFixed(1),
    },
    {
      accessorKey: "totalOtHrs",
      header: "OT hrs",
      cell: (info) => (info.getValue() as number).toFixed(1),
    },
    {
      accessorKey: "totalStWage",
      header: "ST wage",
      cell: (info) => formatCurrency(info.getValue() as number),
    },
    {
      accessorKey: "totalOtWage",
      header: "OT wage",
      cell: (info) => formatCurrency(info.getValue() as number),
    },
    {
      accessorKey: "totalWage",
      header: "Total wage",
      cell: (info) => formatCurrency(info.getValue() as number),
    },
  ];
}

const columns = buildColumns();

export function PayrollTable({ rows }: { rows: PayrollRowDto[] }) {
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({ employeeId: false });

  const groupBy = React.useMemo((): GroupByOption => {
    if (grouping.includes("employeeId")) return "employee";
    if (grouping.includes("weekEnding")) return "week";
    return "none";
  }, [grouping]);

  const setGroupBy = React.useCallback((opt: GroupByOption) => {
    if (opt === "employee") setGrouping(["employeeId"]);
    else if (opt === "week") setGrouping(["weekEnding"]);
    else setGrouping([]);
  }, []);

  const levelOptions = React.useMemo(() => {
    const set = new Set(rows.map((r) => r.level));
    return Array.from(set).sort();
  }, [rows]);

  const occupationOptions = React.useMemo(() => {
    const set = new Set(rows.map((r) => r.occupation));
    return Array.from(set).sort();
  }, [rows]);

  // Defer table-driven state updates to avoid "state update on unmounted component" when table calls these during render/scroll
  const onGroupingChange = React.useCallback(
    (updater: React.SetStateAction<GroupingState>) => {
      React.startTransition(() => setGrouping(updater));
    },
    []
  );
  const onColumnFiltersChange = React.useCallback(
    (updater: React.SetStateAction<ColumnFiltersState>) => {
      React.startTransition(() => setColumnFilters(updater));
    },
    []
  );
  const onGlobalFilterChange = React.useCallback(
    (updater: React.SetStateAction<string>) => {
      React.startTransition(() => setGlobalFilter(updater));
    },
    []
  );
  const onColumnVisibilityChange = React.useCallback(
    (updater: React.SetStateAction<Record<string, boolean>>) => {
      React.startTransition(() => setColumnVisibility(updater));
    },
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table required by plan
  const table = useReactTable({
    data: rows,
    columns,
    state: {
      grouping,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onGroupingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const name = String(row.original.employeeName ?? "").toLowerCase();
      return name.includes(String(filterValue).toLowerCase());
    },
  });

  const levelFilter = columnFilters.find((f) => f.id === "level")?.value as
    | string
    | undefined;
  const occupationFilter = columnFilters.find((f) => f.id === "occupation")
    ?.value as string | undefined;

  const setLevelFilter = (value: string) => {
    setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== "level");
      if (!value) return rest;
      return [...rest, { id: "level", value }];
    });
  };

  const setOccupationFilter = (value: string) => {
    setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== "occupation");
      if (!value) return rest;
      return [...rest, { id: "occupation", value }];
    });
  };

  function renderRows() {
    const rowsToRender = table.getRowModel().rows;
    const result: React.ReactNode[] = [];
    const groupByCol = grouping[0];
    for (const row of rowsToRender) {
      const isGrouped = row.getIsGrouped();
      result.push(
        <TableRow
          key={row.id}
          className={cn(isGrouped && "bg-muted/50 font-medium")}
        >
          {row.getVisibleCells().map((cell) => {
            const isGroupDisplay =
              isGrouped &&
              (cell.column.id === groupByCol ||
                (groupByCol === "employeeId" &&
                  cell.column.id === "employeeName") ||
                (groupByCol === "weekEnding" &&
                  cell.column.id === "weekEnding"));
            return (
              <TableCell key={cell.id}>
                {isGroupDisplay ? (
                  <>
                    {row.subRows.length > 0 && (
                      <span className="mr-2">
                        ({row.subRows.length} week
                        {row.subRows.length !== 1 ? "s" : ""})
                      </span>
                    )}
                    {cell.column.id === "employeeName" ||
                    cell.column.id === "employeeId"
                      ? row.original.employeeName
                      : cell.column.id === "weekEnding"
                        ? formatDate(row.original.weekEnding)
                        : null}
                  </>
                ) : !isGrouped && cell.column.columnDef.cell ? (
                  flexRender(cell.column.columnDef.cell, cell.getContext())
                ) : null}
              </TableCell>
            );
          })}
        </TableRow>
      );
      if (isGrouped && row.subRows.length > 0) {
        for (const subRow of row.subRows) {
          result.push(
            <TableRow key={subRow.id}>
              {subRow.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        }
      }
    }
    return result;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="name-search" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name-search"
            placeholder="Search by name..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-[200px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="level-filter" className="text-sm font-medium">
            Level
          </label>
          <Select
            value={levelFilter ?? "all"}
            onValueChange={(v) =>
              setLevelFilter(v === "all" || v === null ? "" : v)
            }
          >
            <SelectTrigger id="level-filter" className="w-[160px]">
              <SelectValue placeholder="All levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              {levelOptions.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="occupation-filter" className="text-sm font-medium">
            Occupation
          </label>
          <Select
            value={occupationFilter ?? "all"}
            onValueChange={(v) =>
              setOccupationFilter(v === "all" || v === null ? "" : v)
            }
          >
            <SelectTrigger id="occupation-filter" className="w-[180px]">
              <SelectValue placeholder="All occupations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All occupations</SelectItem>
              {occupationOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="group-by" className="text-sm font-medium">
            Group by
          </label>
          <Select
            value={groupBy}
            onValueChange={(v) => setGroupBy(v as GroupByOption)}
          >
            <SelectTrigger id="group-by" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="week">Payroll week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header ?? "",
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              renderRows()
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
