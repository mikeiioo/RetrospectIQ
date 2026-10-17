"use client";

import { useRouter } from "next/navigation";
import { useState, type DragEvent, type FormEvent } from "react";
import { cn, DataPanel, PageHeader, StatusBadge } from "@/components/ui";

export default function UploadPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const formFile = formData.get("file");
    const file =
      selectedFile ??
      (formFile instanceof File && formFile.size > 0 ? formFile : null);

    if (!file) {
      setError("Permit PDF is required");
      setSubmitting(false);
      return;
    }

    formData.set("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data: { id?: string; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.id) {
        throw new Error(data.error || `Upload failed (${res.status})`);
      }
      router.push(`/permits/${data.id}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setSubmitting(false);
    }
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }

  return (
    <main className="app-page">
      <PageHeader
        eyebrow="Upload Documents"
        title="Permit Intake"
        description="Create a building record from a text-based PDF permit and route it into the retrofit intelligence workflow."
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DataPanel title="Document Upload" description="PDF only. Maximum file size is 25 MB.">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                label="Building name"
                name="buildingName"
                placeholder="100 Main Street Office Tower"
                required
              />
              <TextField
                label="Address"
                name="address"
                placeholder="100 Main St, Atlanta, GA 30303"
                required
              />
            </div>

            <label
              htmlFor="permit-file"
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={cn(
                "flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed p-8 text-center transition",
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/60",
              )}
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                PDF
              </span>
              <span className="mt-5 text-lg font-semibold text-slate-950">
                Drop permit PDF here
              </span>
              <span className="mt-2 text-sm leading-6 text-slate-500">
                {selectedFile
                  ? `${selectedFile.name} - ${formatBytes(selectedFile.size)}`
                  : "or select a file from your device"}
              </span>
              <input
                id="permit-file"
                type="file"
                name="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </label>

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Uploading…" : "Upload permit"}
            </button>
          </form>
        </DataPanel>

        <DataPanel title="Processing Status" description="Current upload session.">
          <div className="space-y-4">
            <PipelineStep
              label="Building metadata"
              status="Ready"
              active
              detail="Name and address are validated before upload."
            />
            <PipelineStep
              label="Secure PDF storage"
              status={submitting ? "Processing" : selectedFile ? "Ready" : "Waiting"}
              active={submitting || !!selectedFile}
              detail="The permit is stored under the existing S3 permits path."
            />
            <PipelineStep
              label="AI dashboard"
              status={submitting ? "Queued" : "Waiting"}
              active={submitting}
              detail="The dashboard opens after the permit record is created."
            />
          </div>
        </DataPanel>
      </section>
    </main>
  );
}

function TextField({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        required={required}
        className="mt-2 block min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm shadow-slate-200/70 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}

function PipelineStep({
  label,
  status,
  detail,
  active,
}: {
  label: string;
  status: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-semibold text-slate-950">{label}</p>
        <StatusBadge label={status} tone={active ? "blue" : "slate"} />
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
