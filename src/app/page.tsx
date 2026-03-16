import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16">
      <h1 className="text-2xl font-semibold">Payroll</h1>
      <Link
        href="/payroll"
        className="text-primary underline underline-offset-4 hover:no-underline"
      >
        View payroll report
      </Link>
    </div>
  );
}
