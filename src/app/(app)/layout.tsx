import SpotifyPlayer from "@/components/SpotifyPlayer";
import { I18nProvider } from "@/context/I18nContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-grid-pattern">
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6">
          {children}
        </main>
        <SpotifyPlayer />
      </div>
    </I18nProvider>
  );
}
