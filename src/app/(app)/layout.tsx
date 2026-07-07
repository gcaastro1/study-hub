import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0 md:pl-64 min-h-screen p-4 md:p-8">
        {children}
      </main>
    </AuthGuard>
  );
}
