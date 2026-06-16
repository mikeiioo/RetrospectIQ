import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500">RetrospectIQ</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
          Turn permit paperwork into retrofit intelligence.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          Upload a building permit PDF. We score retrofit potential and recommend upgrades that
          reduce energy use, save money, and cut carbon.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-500">
          Current flow: upload → S3 permit storage → MongoDB metadata → retrofit dashboard.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/upload"
            className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Upload a permit
          </Link>
          <Link
            href="/permits"
            className="rounded-md border border-gray-300 px-5 py-3 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            View permits
          </Link>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 gap-10 sm:grid-cols-3">
        <Feature
          title="Impact Score"
          body="A 0–100 score summarizing retrofit potential at a glance."
        />
        <Feature
          title="Energy & Savings"
          body="Estimated energy reduction percentage and annual dollar savings."
        />
        <Feature
          title="Recommended Upgrades"
          body="Concrete, prioritized upgrade options for each building."
        />
      </div>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{body}</p>
    </div>
  );
}
