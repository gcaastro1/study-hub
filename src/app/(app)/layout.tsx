import HUDTopBar from "@/components/HUDTopBar";
import AuthGuard from "@/components/AuthGuard";
import ClassSelectionModal from "@/components/ClassSelectionModal";
import FactionSelectionModal from "@/components/FactionSelectionModal";
import { I18nProvider } from "@/context/I18nContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <I18nProvider>
        <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-grid-pattern">
          <HUDTopBar />
          <ClassSelectionModal />
          <FactionSelectionModal />
          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </I18nProvider>
    </AuthGuard>
  );
}
