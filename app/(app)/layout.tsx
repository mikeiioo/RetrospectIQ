import { cookies } from "next/headers";
import { AppShell, SIDEBAR_COOKIE } from "@/components/AppShell";
import { requireUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  // Read on the server so the sidebar renders in the saved state without a flash.
  const collapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === "collapsed";

  return (
    <AppShell user={user} initialCollapsed={collapsed}>
      {children}
    </AppShell>
  );
}
