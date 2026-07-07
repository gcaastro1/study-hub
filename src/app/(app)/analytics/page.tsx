import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Meu Desempenho
          </h1>
          <p className="text-foreground/60 mt-1">
            Acompanhe sua evolução e estatísticas de estudo
          </p>
        </div>
      </header>

      <AnalyticsDashboard />
    </div>
  );
}
