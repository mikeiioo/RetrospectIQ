import Nav from "@/components/Nav";
import { requireUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <>
      <Nav user={user} />
      <div className="min-h-screen lg:pl-72">{children}</div>
    </>
  );
}
