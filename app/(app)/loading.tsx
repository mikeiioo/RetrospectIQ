export default function Loading() {
  return (
    <main className="app-page animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-24 rounded-full bg-slate-200" />
      <div className="mt-4 h-10 w-80 max-w-full rounded-2xl bg-slate-200" />
      <div className="mt-4 h-4 w-[28rem] max-w-full rounded-full bg-slate-200" />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-36 rounded-[20px] border border-slate-200 bg-white" />
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="h-96 rounded-[20px] border border-slate-200 bg-white" />
        <div className="h-96 rounded-[20px] border border-slate-200 bg-white" />
      </div>
    </main>
  );
}
