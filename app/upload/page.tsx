"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function UploadPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
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

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Upload permit</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Upload a permit PDF along with the building name and address. We&apos;ll generate a
        retrofit dashboard for it.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <TextField
          label="Building name"
          name="buildingName"
          placeholder="100 Main Street Office Tower"
          required
        />
        <TextField
          label="Address"
          name="address"
          placeholder="100 Main St, Springfield, MA 01103"
          required
        />

        <div>
          <label className="block text-sm font-medium">Permit PDF</label>
          <input
            type="file"
            name="file"
            accept="application/pdf"
            required
            className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800 dark:file:bg-white dark:file:text-black dark:hover:file:bg-gray-200"
          />
          <p className="mt-1 text-xs text-gray-500">PDF only · 25 MB max</p>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          {submitting ? "Uploading…" : "Upload permit"}
        </button>
      </form>
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
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        required={required}
        className="mt-2 block w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:focus:border-white dark:focus:ring-white"
      />
    </div>
  );
}
