"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/button";
import {
  LoaderIcon,
  FileUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  TableIcon,
} from "lucide-react";
import {
  PAYROLL_UPLOAD_VALIDATION_CHECKS,
  EXPECTED_PAYROLL_CSV_HEADERS,
} from "../uploadValidationChecks";

interface ValidationErrorItem {
  rowIndex: number;
  message: string;
}

type Status = "idle" | "uploading" | "success" | "error";

export function PayrollUploadForm() {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const [errors, setErrors] = React.useState<ValidationErrorItem[]>([]);
  const [rowsAdded, setRowsAdded] = React.useState<number | null>(null);
  const [skipInvalidRows, setSkipInvalidRows] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [validationRulesOpen, setValidationRulesOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isCsv = (f: File) =>
    f.type === "text/csv" || f.name.toLowerCase().endsWith(".csv");

  const handleFile = React.useCallback((f: File | null) => {
    setFile(f);
    setErrors([]);
    setRowsAdded(null);
    setStatus("idle");
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const items = e.dataTransfer.files;
    if (items.length === 0) return;
    const f = items[0]!;
    if (!isCsv(f)) {
      setStatus("error");
      setErrors([{ rowIndex: 0, message: "Only CSV files are allowed" }]);
      return;
    }
    handleFile(f);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!isCsv(f)) {
      setStatus("error");
      setErrors([{ rowIndex: 0, message: "Only CSV files are allowed" }]);
      return;
    }
    handleFile(f);
  };

  const upload = React.useCallback(async () => {
    if (!file) return;
    setStatus("uploading");
    setErrors([]);
    setRowsAdded(null);

    const formData = new FormData();
    formData.set("file", file);
    if (skipInvalidRows) {
      formData.set("skipInvalidRows", "true");
    }

    try {
      const res = await fetch("/api/payroll/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrors(
          Array.isArray(data.errors)
            ? data.errors
            : [{ rowIndex: 0, message: data.message ?? "Upload failed" }]
        );
        if (typeof data.rowsAdded === "number") {
          setRowsAdded(data.rowsAdded);
        }
        return;
      }

      setStatus("success");
      setRowsAdded(typeof data.rowsAdded === "number" ? data.rowsAdded : 0);
    } catch (err) {
      setStatus("error");
      setErrors([
        {
          rowIndex: 0,
          message: err instanceof Error ? err.message : "Network error",
        },
      ]);
    }
  }, [file, skipInvalidRows]);

  React.useEffect(() => {
    if (file && status === "idle") {
      upload();
    }
  }, [file, status, upload]);

  const zoneMinimal = status === "uploading";
  const canDrop = status === "idle" || (status === "error" && !file);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/30">
        <button
          type="button"
          onClick={() => setValidationRulesOpen((open) => !open)}
          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold hover:bg-muted/50"
          aria-expanded={validationRulesOpen}
        >
          {validationRulesOpen ? (
            <ChevronDownIcon className="size-4 shrink-0" />
          ) : (
            <ChevronRightIcon className="size-4 shrink-0" />
          )}
          Validation rules and expected headers
        </button>
        {validationRulesOpen && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            <h2 className="mb-2 text-sm font-semibold">
              Validation checks (before upload)
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Your CSV will be validated against these rules. If any row fails,
              no data is added.
            </p>
            <ol className="list-inside list-decimal space-y-1 text-sm">
              {PAYROLL_UPLOAD_VALIDATION_CHECKS.map((check, i) => (
                <li key={i}>{check}</li>
              ))}
            </ol>
            <h3 className="mt-4 mb-2 text-sm font-semibold">
              Expected headers (exact match)
            </h3>
            <p className="mb-2 text-xs text-muted-foreground">
              The first row of your CSV must have exactly these column names
              (row 1). Order does not matter; spelling and punctuation must
              match.
            </p>
            <code
              className="block overflow-x-auto rounded bg-muted px-2 py-2 text-xs"
              title="Copy column names"
            >
              {EXPECTED_PAYROLL_CSV_HEADERS.join(", ")}
            </code>
          </div>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/30 p-4">
        <input
          type="checkbox"
          checked={skipInvalidRows}
          onChange={(e) => setSkipInvalidRows(e.target.checked)}
          className="mt-0.5 size-4 rounded border-input"
        />
        <span className="text-sm">
          <span className="font-medium">Skip invalid rows</span>
          <span className="ml-1 text-muted-foreground">
            If selected and validation fails, valid rows are still inserted.
          </span>
        </span>
      </label>

      <div
        className={cn(
          "rounded-lg border-2 border-dashed transition-all",
          isDragging && canDrop && "border-primary bg-primary/5",
          !isDragging && "border-muted-foreground/25 bg-muted/20",
          zoneMinimal && "min-h-0 py-4"
        )}
        style={zoneMinimal ? { minHeight: "80px" } : undefined}
      >
        {status === "uploading" ? (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading…</p>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center gap-2 p-8 text-center"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleInputChange}
              className="hidden"
            />
            <FileUpIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop a CSV file here, or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="font-medium text-primary underline underline-offset-4 hover:no-underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              One file at a time, CSV only.
            </p>
          </div>
        )}
      </div>

      {status === "error" &&
        errors.length > 0 &&
        rowsAdded !== null &&
        rowsAdded > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {rowsAdded} row{rowsAdded !== 1 ? "s" : ""} successfully inserted.
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/payroll" />}
              className="gap-2"
            >
              <TableIcon className="size-4" />
              View successfully uploaded data
            </Button>
          </div>
        )}

      {status === "error" && errors.length > 0 && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <p className="mb-2 font-medium text-destructive">Invalid rows</p>
          <p className="mb-3 text-xs text-muted-foreground">
            A row can have multiple validation errors; all are listed below.
          </p>
          {(() => {
            const byRow = errors.reduce<Map<number, string[]>>((acc, e) => {
              const list = acc.get(e.rowIndex) ?? [];
              list.push(e.message);
              acc.set(e.rowIndex, list);
              return acc;
            }, new Map());
            const sortedRows = Array.from(byRow.entries()).sort(
              ([a], [b]) => a - b
            );
            return (
              <ul className="space-y-3 text-sm text-destructive">
                {sortedRows.map(([rowIndex, messages]) => (
                  <li key={rowIndex}>
                    <span className="font-medium">Row {rowIndex}:</span>
                    <ul className="ml-4 mt-1 list-inside list-disc space-y-0.5 text-destructive/90">
                      {messages.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      )}

      {status === "success" && rowsAdded !== null && (
        <div className="rounded-md border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-800 dark:text-green-200">
          Success: {rowsAdded} row{rowsAdded !== 1 ? "s" : ""} added.
        </div>
      )}
    </div>
  );
}
