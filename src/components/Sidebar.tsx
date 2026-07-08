"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, BrainCircuit, BarChart2, Layers, Globe, Crown } from "lucide-react";
import { useAppSelector } from "@/store";

export default function Sidebar() {
  const pathname = usePathname();
  const { equippedTheme } = useAppSelector(state => state.inventory);

  const NAV_ITEMS = [
    { name: "Painel", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mascote", href: "/pet", icon: Crown },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Leaderboard", href: "/leaderboard", icon: Globe },
    { name: "Flashcards", href: "/flashcards", icon: Layers },
    { name: "Quizzes", href: "/quizzes", icon: BrainCircuit },
    { name: "Loja", href: "/store", icon: Store },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface/90 backdrop-blur-md border-t border-surface-border">
        <ul className="flex justify-around items-center h-16">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                    isActive ? "text-primary" : "text-foreground/50 hover:text-foreground"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "drop-shadow-md" : ""}`} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-surface-border glass-panel rounded-none">
        <div className="p-6 flex items-center gap-3 border-b border-surface-border/50">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            Study Hub <span className="text-primary text-sm">V2</span>
          </h1>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                      isActive 
                        ? "bg-primary/20 text-primary shadow-sm" 
                        : "text-foreground/70 hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
