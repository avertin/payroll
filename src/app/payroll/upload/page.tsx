import Link from "next/link";
import { PayrollUploadForm } from "@/features/payroll/components/PayrollUploadForm";
import { ChevronRightIcon } from "lucide-react";

export default function PayrollUploadPage() {
  return (
    <div className="container mx-auto space-y-8 py-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/payroll" className="hover:text-foreground hover:underline">
          Payroll
        </Link>
        <ChevronRightIcon className="size-4 shrink-0" />
        <span className="text-foreground">Upload</span>
      </nav>
      <h1 className="text-2xl font-semibold">Upload payroll</h1>
      <PayrollUploadForm />
    </div>
  );
}
