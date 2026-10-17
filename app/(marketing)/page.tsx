import Link from "next/link";
import {
  BuildingIcon,
  LightbulbIcon,
  MapPinIcon,
  PermitIcon,
  UploadIcon,
} from "@/components/icons";
import { getSessionUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getSessionUser();
  const primary = user
    ? { href: "/dashboard", label: "Go to dashboard" }
    : { href: "/sign-up", label: "Get started free" };

  return (
    <main>
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
          <div>
            <p className="text-sm font-semibold text-blue-300">Permit intelligence for building retrofits</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Turn permit paperwork into retrofit decisions.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              Upload a building permit and RetrospectIQ extracts the building&apos;s systems, scores its
              retrofit potential, and recommends the upgrades most likely to cut energy use and
              carbon.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primary.href}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500"
              >
                {primary.label}
              </Link>
              <Link
                href="/learn"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Learn about retrofits
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-navy-950/50 backdrop-blur">
            <div className="rounded-2xl bg-white p-5 text-slate-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Example building</p>
                  <p className="mt-1 font-semibold">1970s Midtown office</p>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                  High priority
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[72%] rounded-full bg-amber-500" />
              </div>
              <p className="mt-2 text-sm font-semibold">72/100 retrofit readiness</p>
              <ul className="mt-5 space-y-2 text-sm">
                {["LED lighting conversion", "High-efficiency HVAC upgrade", "Building automation system"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">Illustrative example</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="text-sm font-semibold text-blue-600">How it works</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">From PDF to prioritized upgrades</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Step
            number="1"
            icon={<UploadIcon />}
            title="Upload a permit"
            text="Drop in a text-based permit PDF. It's stored securely and tied to your account."
          />
          <Step
            number="2"
            icon={<PermitIcon />}
            title="AI builds a profile"
            text="We extract year built, size, HVAC, lighting, electrical service, and past upgrades, and leave unknowns blank instead of guessing."
          />
          <Step
            number="3"
            icon={<LightbulbIcon />}
            title="Get recommendations"
            text="A transparent scoring model ranks retrofit potential and estimates savings and CO₂ reduction."
          />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3">
          <Feature
            icon={<BuildingIcon />}
            title="Portfolio view"
            text="See every building's readiness, status, and estimated savings side by side."
          />
          <Feature
            icon={<MapPinIcon />}
            title="Location at a glance"
            text="Each building has a map preview that opens straight into Google Maps."
          />
          <Feature
            icon={<LightbulbIcon />}
            title="Clear next steps"
            text="Recommendations explain why they apply, from LED conversions to controls and audits."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-semibold text-slate-950">Ready to find your best retrofit opportunities?</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Start with one permit. RetrospectIQ is a prototype: treat its estimates as a starting point
          for a professional energy audit, not a replacement for one.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={primary.href}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            {primary.label}
          </Link>
          <Link
            href="/learn"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            Learn more
          </Link>
        </div>
      </section>
    </main>
  );
}

function Step({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">{icon}</span>
        <span className="text-sm font-semibold text-slate-400">Step {number}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div>
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-navy-950 text-blue-300">{icon}</span>
      <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
