import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";
import ClassSelectionModal from "@/components/ClassSelectionModal";
import FactionSelectionModal from "@/components/FactionSelectionModal";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Sidebar />
      <ClassSelectionModal />
      <FactionSelectionModal />
      <main className="flex-1 pb-20 md:pb-0 md:pl-64 min-h-screen p-4 md:p-8">
        {children}
      </main>
    </AuthGuard>
  );
}
