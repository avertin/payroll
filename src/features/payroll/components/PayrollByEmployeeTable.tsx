"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/shared/utils";
import type { PayrollByEmployeeRowDto } from "../dto";
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

function buildColumns(): ColumnDef<PayrollByEmployeeRowDto>[] {
  return [
    {
      accessorKey: "employeeName",
      header: "Employee",
      enableSorting: false,
      cell: (info) => String(info.getValue()),
      filterFn: (row, _columnId, filterValue) => {
        const name = String(row.original.employeeName ?? "").toLowerCase();
        return name.includes(String(filterValue).toLowerCase());
      },
    },
    {
      accessorKey: "occupation",
      id: "occupation",
      header: "Occupation",
      enableSorting: false,
      cell: (info) => String(info.getValue()),
      filterFn: (row, _columnId, filterValue) =>
        row.original.occupation === filterValue,
    },
    {
      accessorKey: "level",
      id: "level",
      header: "Level",
      enableSorting: false,
      cell: (info) => String(info.getValue()),
      filterFn: (row, _columnId, filterValue) =>
        row.original.level === filterValue,
    },
    {
      id: "totalAllTimePay",
      header: "Total pay",
      accessorFn: (row) => row.totalAllTimePay,
      enableSorting: true,
      cell: (info) => formatCurrency(info.getValue() as number),
    },
    {
      id: "totalHours",
      header: "Total hrs",
      accessorFn: (row) => row.totalHours,
      enableSorting: true,
      cell: (info) => (info.getValue() as number).toFixed(1),
    },
    {
      id: "avgWeeklyHours",
      header: "Avg weekly hrs",
      accessorFn: (row) => row.avgWeeklyHours,
      enableSorting: true,
      cell: (info) => (info.getValue() as number).toFixed(1),
    },
    {
      id: "maxSingleWeekHours",
      header: "Max week hrs",
      accessorFn: (row) => row.maxSingleWeekHours,
      enableSorting: true,
      cell: (info) => (info.getValue() as number).toFixed(1),
    },
    {
      id: "minSingleWeekHours",
      header: "Min week hrs",
      accessorFn: (row) => row.minSingleWeekHours,
      enableSorting: true,
      cell: (info) => (info.getValue() as number).toFixed(1),
    },
    {
      id: "pctOt",
      header: "% OT",
      accessorFn: (row) => row.pctOt,
      enableSorting: true,
      cell: (info) => formatPercent(info.getValue() as number),
    },
    {
      id: "numberOfWeeksWorked",
      header: "Weeks",
      accessorFn: (row) => row.numberOfWeeksWorked,
      enableSorting: true,
      cell: (info) => String(info.getValue()),
    },
    {
      id: "rateVariance",
      header: "Rate changed",
      accessorFn: (row) => row.rateVariance,
      enableSorting: true,
      cell: (info) => (info.getValue() ? "Yes" : "No"),
    },
  ];
}

const columns = buildColumns();

export function PayrollByEmployeeTable({
  rows,
}: {
  rows: PayrollByEmployeeRowDto[];
}) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const levelOptions = React.useMemo(() => {
    const set = new Set(rows.map((r) => r.level));
    return Array.from(set).sort();
  }, [rows]);

  const occupationOptions = React.useMemo(() => {
    const set = new Set(rows.map((r) => r.occupation));
    return Array.from(set).sort();
  }, [rows]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table required by plan
  const table = useReactTable({
    data: rows,
    columns,
    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="by-emp-name-search" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="by-emp-name-search"
            placeholder="Search by name..."
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="max-w-[200px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="by-emp-level-filter" className="text-sm font-medium">
            Level
          </label>
          <Select
            value={levelFilter ?? "all"}
            onValueChange={(v) =>
              setLevelFilter(v === "all" || v === null ? "" : v)
            }
          >
            <SelectTrigger id="by-emp-level-filter" className="w-[160px]">
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
          <label
            htmlFor="by-emp-occupation-filter"
            className="text-sm font-medium"
          >
            Occupation
          </label>
          <Select
            value={occupationFilter ?? "all"}
            onValueChange={(v) =>
              setOccupationFilter(v === "all" || v === null ? "" : v)
            }
          >
            <SelectTrigger id="by-emp-occupation-filter" className="w-[180px]">
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "flex items-center gap-1 font-medium hover:underline",
                          header.column.getIsSorted() && "underline"
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header ?? "",
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUpIcon className="h-4 w-4" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDownIcon className="h-4 w-4" />
                        ) : (
                          <ArrowUpDownIcon className="h-4 w-4 opacity-50" />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header ?? "",
                        header.getContext()
                      )
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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
