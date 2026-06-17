import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "slate" | "blue" | "sky" | "emerald" | "amber" | "red";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const badgeTone: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
};

const scoreTone = {
  low: "bg-emerald-500",
  moderate: "bg-sky-500",
  high: "bg-amber-500",
  critical: "bg-red-500",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="text-sm font-semibold text-blue-600">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-4xl font-semibold text-slate-950 xl:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-700"
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
    >
      {children}
    </Link>
  );
}

export function KpiCard({
  label,
  value,
  detail,
  tone = "blue",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: Tone;
}) {
  const toneClass: Record<Tone, string> = {
    slate: "from-slate-900 to-slate-700",
    blue: "from-blue-600 to-sky-500",
    sky: "from-sky-500 to-blue-400",
    emerald: "from-emerald-500 to-teal-400",
    amber: "from-amber-500 to-orange-400",
    red: "from-red-500 to-rose-400",
  };

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
      <div
        className={cn(
          "mb-5 h-1.5 w-16 rounded-full bg-gradient-to-r",
          toneClass[tone],
        )}
      />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      {detail && <p className="mt-2 text-sm text-slate-500">{detail}</p>}
    </section>
  );
}

export function DataPanel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function StatusBadge({
  label,
  tone = "slate",
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        badgeTone[tone],
      )}
    >
      {label}
    </span>
  );
}

export function PermitStatusBadge({ status }: { status: string }) {
  const tone =
    status === "scored"
      ? "emerald"
      : status === "scanned_pdf"
        ? "amber"
        : status === "uploaded"
          ? "sky"
          : "blue";

  const label = status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return <StatusBadge label={label} tone={tone} />;
}

export function ScoreBar({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div>
        <div className="h-2 rounded-full bg-slate-100" />
        <p className="mt-2 text-sm font-medium text-slate-500">Not scored</p>
      </div>
    );
  }

  const clamped = Math.max(0, Math.min(100, score));
  const tone =
    clamped >= 80
      ? scoreTone.critical
      : clamped >= 60
        ? scoreTone.high
        : clamped >= 35
          ? scoreTone.moderate
          : scoreTone.low;

  return (
    <div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${clamped}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-950">{clamped}/100</span>
        <span className="text-slate-500">Readiness score</span>
      </div>
    </div>
  );
}

export function BuildingCard({
  href,
  name,
  address,
  year,
  type,
  score,
  status,
}: {
  href: string;
  name: string;
  address: string;
  year: string;
  type: string;
  score: number | null;
  status: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-72 flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <PermitStatusBadge status={status} />
        </div>
        <h3 className="mt-5 text-lg font-semibold leading-6 text-slate-950 group-hover:text-blue-700">
          {name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{address}</p>
      </div>

      <div className="mt-6 space-y-5">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Year built</dt>
            <dd className="mt-1 font-semibold text-slate-950">{year}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Building type</dt>
            <dd className="mt-1 font-semibold text-slate-950">{type}</dd>
          </div>
        </dl>
        <ScoreBar score={score} />
      </div>
    </Link>
  );
}

export function RecommendationCard({
  title,
  priority,
  impact,
  savings,
  description,
  buildingName,
  href,
}: {
  title: string;
  priority: "Low" | "Medium" | "High";
  impact: string;
  savings: string;
  description: string;
  buildingName: string;
  href: string;
}) {
  const tone = priority === "High" ? "red" : priority === "Medium" ? "amber" : "emerald";

  return (
    <Link
      href={href}
      className="block rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{buildingName}</p>
        </div>
        <StatusBadge label={priority} tone={tone} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Sustainability impact</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{impact}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Estimated savings</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{savings}</p>
        </div>
      </div>
    </Link>
  );
}

export function FieldValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl bg-slate-50 p-4">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium leading-6 text-slate-950">{value}</dd>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm shadow-slate-200/70">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
