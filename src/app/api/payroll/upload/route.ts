import {
  parsePayrollCsv,
  validatePayroll,
  uploadPayrollCsv,
} from "@/features/payroll/api";

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { errors: [{ rowIndex: 0, message: "Invalid form data" }] },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return Response.json(
      { errors: [{ rowIndex: 0, message: "No file provided" }] },
      { status: 400 }
    );
  }

  const isCsv =
    file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
  if (!isCsv) {
    return Response.json(
      { errors: [{ rowIndex: 0, message: "Only CSV files are allowed" }] },
      { status: 400 }
    );
  }

  let content: string;
  try {
    content = await file.text();
  } catch {
    return Response.json(
      { errors: [{ rowIndex: 0, message: "Failed to read file" }] },
      { status: 400 }
    );
  }

  const skipInvalidRows =
    formData.get("skipInvalidRows") === "true" ||
    formData.get("skipInvalidRows") === "on";

  const rows = parsePayrollCsv(content);
  const result = validatePayroll(rows);

  if (result.errors.length > 0) {
    if (skipInvalidRows) {
      const rowsAdded = await uploadPayrollCsv({
        employees: result.employees,
        weeklyWages: result.weeklyWages,
      });
      return Response.json(
        { rowsAdded, errors: result.errors },
        { status: 400 }
      );
    }
    return Response.json({ errors: result.errors }, { status: 400 });
  }

  const rowsAdded = await uploadPayrollCsv({
    employees: result.employees,
    weeklyWages: result.weeklyWages,
  });

  return Response.json({ rowsAdded }, { status: 200 });
}
