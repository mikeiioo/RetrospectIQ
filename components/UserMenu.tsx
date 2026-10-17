"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { ChevronDownIcon } from "@/components/icons";
import { SignOutButton } from "@/components/SignOutButton";
import type { SessionUser } from "@/lib/session";

const menuLinkClass =
  "block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950";

export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-white/10"
      >
        <Avatar name={user.name} email={user.email} image={user.image} size={32} />
        <ChevronDownIcon width={16} height={16} className="text-slate-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/20"
        >
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={user.name} email={user.email} image={user.image} size={36} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{user.name || "Account"}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-slate-100" />
          <Link href="/profile" role="menuitem" onClick={close} className={menuLinkClass}>
            Profile
          </Link>
          <Link href="/dashboard" role="menuitem" onClick={close} className={menuLinkClass}>
            Dashboard
          </Link>
          {/* Home/Learn live in the top bar on wider screens; mirror them here for phones. */}
          <div className="sm:hidden">
            <Link href="/" role="menuitem" onClick={close} className={menuLinkClass}>
              Home
            </Link>
            <Link href="/learn" role="menuitem" onClick={close} className={menuLinkClass}>
              Learn
            </Link>
          </div>
          <div className="my-1 h-px bg-slate-100" />
          <SignOutButton className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-700" />
        </div>
      )}
    </div>
  );
}
