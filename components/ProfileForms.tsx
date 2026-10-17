"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Avatar } from "@/components/Avatar";
import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/session";

const inputClass =
  "mt-2 block min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-950 shadow-sm shadow-slate-200/70 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500";
const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60";

type Status = { tone: "success" | "error"; message: string } | null;

function StatusMessage({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <p
      role="status"
      className={
        status.tone === "success"
          ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          : "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
      }
    >
      {status.message}
    </p>
  );
}

export function ProfilePhotoForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<"upload" | "remove" | null>(null);
  const [status, setStatus] = useState<Status>(null);

  async function upload(file: File) {
    setStatus(null);
    setPending("upload");
    const body = new FormData();
    body.set("file", file);
    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", body });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      setStatus({ tone: "success", message: "Profile photo updated." });
      router.refresh();
    } catch (err) {
      setStatus({ tone: "error", message: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setPending(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    setStatus(null);
    setPending("remove");
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      if (!res.ok) throw new Error(`Could not remove photo (${res.status})`);
      setStatus({ tone: "success", message: "Profile photo removed." });
      router.refresh();
    } catch (err) {
      setStatus({ tone: "error", message: err instanceof Error ? err.message : "Could not remove photo" });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar name={user.name} email={user.email} image={user.image} size={88} className="ring-4 ring-slate-100" />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending !== null}
            className={primaryButtonClass}
          >
            {pending === "upload" ? "Uploading…" : user.image ? "Change photo" : "Upload photo"}
          </button>
          {user.image && (
            <button type="button" onClick={remove} disabled={pending !== null} className={secondaryButtonClass}>
              {pending === "remove" ? "Removing…" : "Remove"}
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label="Choose a profile photo"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </div>
      <StatusMessage status={status} />
    </div>
  );
}

export function ProfileInfoForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
    if (!name) {
      setStatus({ tone: "error", message: "Name can't be empty." });
      return;
    }
    setStatus(null);
    setPending(true);
    const { error } = await authClient.updateUser({ name });
    setPending(false);
    if (error) {
      setStatus({ tone: "error", message: error.message ?? "Could not save changes." });
      return;
    }
    setStatus({ tone: "success", message: "Profile saved." });
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="block text-sm font-semibold text-slate-700">
            Name
          </label>
          <input
            id="profile-name"
            name="name"
            type="text"
            autoComplete="name"
            defaultValue={user.name}
            maxLength={100}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="profile-email" className="block text-sm font-semibold text-slate-700">
            Email
          </label>
          <input id="profile-email" type="email" value={user.email} disabled className={inputClass} />
          <p className="mt-1.5 text-xs text-slate-500">Email changes aren&apos;t supported yet.</p>
        </div>
      </div>
      <StatusMessage status={status} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (newPassword !== confirmPassword) {
      setStatus({ tone: "error", message: "New passwords don't match." });
      return;
    }

    setStatus(null);
    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);

    if (error) {
      setStatus({ tone: "error", message: error.message ?? "Could not change password." });
      return;
    }
    formEl.reset();
    setStatus({ tone: "success", message: "Password changed. Other devices have been signed out." });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <PasswordField id="currentPassword" label="Current password" autoComplete="current-password" />
        <PasswordField id="newPassword" label="New password" autoComplete="new-password" minLength={8} />
        <PasswordField id="confirmPassword" label="Confirm new password" autoComplete="new-password" minLength={8} />
      </div>
      <StatusMessage status={status} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}

function PasswordField({
  id,
  label,
  autoComplete,
  minLength,
}: {
  id: string;
  label: string;
  autoComplete: string;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="password"
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className={inputClass}
      />
    </div>
  );
}
