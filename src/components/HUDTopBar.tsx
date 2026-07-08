"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store";
import { useAuth } from "@/context/AuthContext";
import { Settings, LogOut, Terminal, Crosshair, Hexagon } from "lucide-react";

export default function HUDTopBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { level, xp, streak, coins } = useAppSelector(state => state.player);
  
  const xpForNextLevel = (level || 1) * 1000;

  const NAV_LINKS = [
    { href: "/dashboard", label: "[ DASHBOARD ]" },
    { href: "/inventory", label: "[ INVENTORY ]" },
    { href: "/pet", label: "[ SANCTUARY ]" },
  ];

  return (
    <header className="w-full bg-background border-b border-surface-border font-technical relative z-50">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-stretch">
        
        {/* Left: Big Red Title Block */}
        <div className="bg-primary text-white p-4 md:pr-12 chamfered-header flex flex-col justify-center min-w-[300px]">
          <h1 className="text-xl font-bold tracking-widest leading-none mb-1 flex items-center gap-2">
            <Terminal className="w-5 h-5 opacity-70" />
            STUDY HUB DEPT.
          </h1>
          <p className="text-xs font-bold tracking-widest opacity-80 leading-none">
            AUXILIARY PROGRAM // SQUAD NAME
          </p>
        </div>

        {/* Center: Navigation (Tactical style) */}
        <nav className="flex-1 flex items-center justify-center gap-4 px-4 py-2 md:py-0 border-b md:border-b-0 border-surface-border">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div className={`text-xs font-bold tracking-widest px-3 py-2 transition-colors ${
                  isActive 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-foreground/50 hover:text-foreground"
                }`}>
                  {link.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Right: Technical Stats Grid */}
        <div className="flex items-center gap-6 p-4 border-l border-surface-border bg-surface/30">
          
          <div className="flex flex-col">
            <span className="text-[10px] text-foreground/50 tracking-widest">DEPLOYMENT INFO</span>
            <span className="text-xs font-bold text-foreground flex items-center gap-2">
              <Crosshair className="w-3 h-3 text-primary" /> PILOT: {user?.displayName?.split(" ")[0].toUpperCase() || "UNKNOWN"}
            </span>
          </div>

          <div className="w-[1px] h-8 bg-surface-border"></div>

          <div className="flex flex-col">
            <span className="text-[10px] text-foreground/50 tracking-widest">LEVEL / XP</span>
            <span className="text-xs font-bold text-foreground">
              LVL {(level || 1).toString().padStart(2, '0')} // {Math.floor(((xp || 0)/xpForNextLevel)*100)}%
            </span>
          </div>

          <div className="w-[1px] h-8 bg-surface-border"></div>

          <div className="flex flex-col">
            <span className="text-[10px] text-foreground/50 tracking-widest">FUNDS</span>
            <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
              <Hexagon className="w-3 h-3" /> {(coins || 0).toString().padStart(4, '0')}
            </span>
          </div>

          <div className="w-[1px] h-8 bg-surface-border"></div>

          <div className="flex flex-col">
            <span className="text-[10px] text-foreground/50 tracking-widest">STREAK</span>
            <span className="text-xs font-bold text-primary">{(streak || 0).toString().padStart(3, '0')} DAYS</span>
          </div>

          <button 
            onClick={logout}
            className="ml-4 p-2 text-foreground/30 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
          >
            <LogOut className="w-4 h-4" />
          </button>
          
        </div>
        
      </div>
    </header>
  );
}
