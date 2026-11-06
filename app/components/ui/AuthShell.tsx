import Link from "next/link";
import { Building2, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

const FEATURES = [
  "Maintenance dues, invoices and receipts in one place",
  "A resident assistant that answers in plain language",
  "Clear records for every payment and request",
];

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-background lg:grid lg:grid-cols-[1.02fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[#101713] p-10 text-[#f3f7f4] lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-app-grid text-white/[0.055]" />
        <div className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#79c9a6] text-[#08130f]">
            <Building2 className="h-4.5 w-4.5" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            Society<span className="text-[#79c9a6]">AI</span>
          </span>
        </Link>

        <div className="relative max-w-lg">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#79c9a6]">
            Resident portal
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-balance xl:text-5xl">
            A calmer way to manage your society.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[#aebbb3]">
            One clear workspace for maintenance, payments, receipts, and everyday
            questions about your residency.
          </p>

          <ul className="mt-8 space-y-3.5">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-[#d7e0da]"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#79c9a6]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-[#7f8e85]">
          Palm Grove Co-operative Housing Society
        </p>
      </section>

      <section className="flex min-h-dvh flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-[420px]">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2.5 lg:hidden"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Society<span className="text-primary">AI</span>
            </span>
          </Link>

          {children}
        </div>
      </section>
    </main>
  );
}
