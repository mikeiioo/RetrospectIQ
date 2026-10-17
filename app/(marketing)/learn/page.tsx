import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLinkIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Learn · Smart retrofits and energy savings · RetrospectIQ",
  description:
    "A plain-language guide to building retrofits: what they are, which upgrades save the most energy, and how to prioritize them.",
};

const sections = [
  { id: "what", label: "What is a retrofit?" },
  { id: "why", label: "Why it matters" },
  { id: "measures", label: "Common upgrades" },
  { id: "prioritize", label: "How to prioritize" },
  { id: "funding", label: "Incentives" },
  { id: "glossary", label: "Glossary" },
  { id: "sources", label: "Sources" },
];

const measures = [
  {
    title: "LED lighting",
    effort: "Low cost · fast payback",
    text: "ENERGY STAR certified LED bulbs use at least 75% less energy than incandescent lighting and last up to 25 times longer. Replacing fluorescent tubes and HID fixtures in older commercial spaces is one of the most common first steps.",
  },
  {
    title: "Smart controls & sensors",
    effort: "Low to moderate cost",
    text: "Occupancy sensors, daylight dimming, and scheduling turn lighting and equipment off when spaces are empty. ENERGY STAR certified smart thermostats save about 8% on heating and cooling bills on average.",
  },
  {
    title: "Building automation (BAS)",
    effort: "Moderate cost",
    text: "A building automation system ties HVAC, lighting, and ventilation together so they run on schedules and respond to real conditions, and it makes problems visible before they waste energy.",
  },
  {
    title: "Heat pumps & efficient HVAC",
    effort: "Higher cost · long life",
    text: "Heat pumps move heat instead of generating it. The U.S. Department of Energy notes they can cut electricity use for heating by about 50% compared with electric resistance heating. Older rooftop units and boilers are frequent replacement candidates.",
  },
  {
    title: "Envelope: insulation & air sealing",
    effort: "Varies",
    text: "Sealing leaks and adding insulation reduce how hard heating and cooling systems have to work. Window upgrades and cool roofs can also help, depending on climate and building type.",
  },
  {
    title: "Retro-commissioning",
    effort: "Low cost",
    text: "Tuning existing equipment so it runs as designed (fixing schedules, sensors, and setpoints) often finds savings without buying anything new.",
  },
];

const glossary = [
  ["Retrofit", "Upgrading an existing building's systems or structure to improve performance."],
  ["Benchmarking", "Tracking a building's energy use over time and comparing it with similar buildings."],
  ["Energy audit", "A professional assessment of where a building uses energy and which upgrades would pay off."],
  ["EUI", "Energy Use Intensity: annual energy use divided by floor area, used to compare buildings of different sizes."],
  ["HVAC", "Heating, ventilation, and air conditioning."],
  ["BAS", "Building automation system: centralized control of HVAC, lighting, and other systems."],
  ["Payback period", "How long an upgrade's savings take to cover its upfront cost."],
  ["Scope 2 emissions", "Indirect emissions from the electricity, heat, or steam a building buys."],
];

const sources = [
  { label: "U.S. Department of Energy: Energy Saver", href: "https://www.energy.gov/energysaver" },
  { label: "ENERGY STAR: Commercial buildings", href: "https://www.energystar.gov/buildings" },
  { label: "ENERGY STAR Portfolio Manager (benchmarking)", href: "https://www.energystar.gov/buildings/benchmark" },
  { label: "DSIRE: Database of incentives for renewables & efficiency", href: "https://www.dsireusa.org/" },
];

export default function LearnPage() {
  return (
    <main>
      <section className="bg-navy-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <p className="text-sm font-semibold text-blue-300">Learn</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Smart retrofits and energy savings, explained
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            A plain-language guide to upgrading existing buildings: what to upgrade, why it matters,
            and how to decide where to start.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24 space-y-1 text-sm">
            <p className="mb-3 font-semibold text-slate-950">On this page</p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-lg px-3 py-1.5 text-slate-500 transition hover:bg-white hover:text-slate-950"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 space-y-14">
          <Section id="what" title="What is a retrofit?">
            <p>
              A retrofit is any upgrade to an existing building that makes it perform better, usually
              by using less energy, running more comfortably, or producing fewer emissions. It can be
              as simple as swapping light fixtures or as involved as replacing a heating system and
              re-insulating walls.
            </p>
            <p>
              A <strong>smart</strong> retrofit adds sensing and control: equipment that responds to
              occupancy, time of day, and weather, so savings don&apos;t depend on someone remembering
              to flip a switch.
            </p>
          </Section>

          <Section id="why" title="Why it matters">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat value="~40%" label="of U.S. energy use goes to buildings, according to the Department of Energy." />
              <Stat value="~30%" label="of the energy used in commercial buildings is wasted on average, per ENERGY STAR." />
              <Stat value="75%" label="less energy used by ENERGY STAR LEDs compared with incandescent bulbs." />
            </div>
            <p>
              Most buildings standing today will still be in use for decades, so improving existing
              buildings, not only constructing efficient new ones, is central to reducing energy
              costs and emissions. Retrofits also tend to improve comfort, air quality, and
              equipment reliability.
            </p>
          </Section>

          <Section id="measures" title="Common upgrades">
            <div className="grid gap-4 md:grid-cols-2">
              {measures.map((measure) => (
                <div
                  key={measure.title}
                  className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70"
                >
                  <h3 className="font-semibold text-slate-950">{measure.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-blue-600">{measure.effort}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{measure.text}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="prioritize" title="How to prioritize">
            <ol className="space-y-4">
              {[
                ["Measure first", "Benchmark the building's energy use (ENERGY STAR Portfolio Manager is free) so you know where it stands and can verify savings later."],
                ["Start with low-cost measures", "Lighting, controls, and retro-commissioning are usually fast to install and pay back quickly."],
                ["Reduce load before replacing equipment", "Fixing the envelope and controls first can mean a smaller, cheaper HVAC system when it's time to replace one."],
                ["Time big upgrades to end of life", "Replacing equipment when it's already due avoids paying twice and makes efficient options easier to justify."],
                ["Get a professional audit", "Tools like RetrospectIQ help you shortlist opportunities; an audit confirms costs, savings, and sequencing for your building."],
              ].map(([title, text], index) => (
                <li key={title} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-950 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-950">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="funding" title="Incentives">
            <p>
              Utility rebates, state programs, and federal tax provisions can offset a meaningful
              share of retrofit costs, but they change often and vary by location. Check{" "}
              <a href="https://www.dsireusa.org/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:text-blue-800">
                DSIRE
              </a>{" "}
              and your electric and gas utility for current programs before planning a project.
            </p>
            <p>
              Some cities also require large buildings to benchmark and report energy use. In
              Atlanta, for example, the Commercial Buildings Energy Efficiency Ordinance covers larger
              commercial buildings. Confirm current requirements with your city.
            </p>
          </Section>

          <Section id="glossary" title="Glossary">
            <dl className="divide-y divide-slate-200 rounded-[20px] border border-slate-200 bg-white">
              {glossary.map(([term, definition]) => (
                <div key={term} className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                  <dt className="font-semibold text-slate-950">{term}</dt>
                  <dd className="text-sm leading-6 text-slate-600">{definition}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="sources" title="Sources & further reading">
            <ul className="space-y-2">
              {sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800"
                  >
                    {source.label}
                    <ExternalLinkIcon width={14} height={14} />
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-500">
              Figures are general averages from the sources above; results for a specific building
              vary.
            </p>
          </Section>

          <div className="rounded-[20px] bg-navy-950 p-8 text-white">
            <h2 className="text-2xl font-semibold">See where your buildings stand</h2>
            <p className="mt-2 max-w-xl text-slate-300">
              Upload a permit and get a retrofit readiness score with recommended next steps.
            </p>
            <Link
              href="/upload"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Upload a permit
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-4 leading-7 text-slate-600">{children}</div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
      <p className="text-3xl font-semibold text-navy-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{label}</p>
    </div>
  );
}
