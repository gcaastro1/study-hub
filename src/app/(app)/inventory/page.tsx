"use client";

import { useAppSelector } from "@/store";
import { useI18n } from "@/context/I18nContext";
import { Shield, Hexagon, Crosshair, Cpu } from "lucide-react";
import Image from "next/image";

export default function InventoryPage() {
  const { t } = useI18n();
  const { unlockedBadges, inventory, ownedPets, isLoaded } = useAppSelector(state => state.inventory);

  if (!isLoaded) {
    return (
      <div className="flex-1 h-full flex items-center justify-center font-technical">
        <div className="text-primary animate-pulse tracking-widest">&gt;&gt; LOADING INVENTORY DATA...</div>
      </div>
    );
  }

  const inventoryEntries = Object.entries(inventory || {});

  return (
    <div className="flex flex-col gap-6 h-full font-sans">
      
      {/* Header */}
      <div className="bg-primary text-white p-2 px-4 chamfered-box">
        <h2 className="text-sm font-technical font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          {t("inventory.title")}
        </h2>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Badges Box */}
        <div className="bg-surface/30 border border-surface-border flex flex-col chamfered-box">
          <div className="bg-surface border-b border-surface-border p-2">
             <span className="text-[10px] font-technical tracking-widest text-foreground/50 flex items-center gap-2">
               <Shield className="w-3 h-3" />
               [{t("inventory.badges")}]
             </span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {unlockedBadges && unlockedBadges.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {unlockedBadges.map((badge, i) => (
                  <div key={i} className="aspect-square bg-surface border border-surface-border flex items-center justify-center p-2 hover:border-primary/50 transition-colors group relative">
                     {badge.icon && badge.icon.includes('/') ? (
                        <Image src={badge.icon} alt={badge.name} width={40} height={40} className="group-hover:scale-110 transition-transform" />
                     ) : (
                        <Shield className="w-8 h-8 text-primary/70 group-hover:text-primary transition-colors" />
                     )}
                     <div className="absolute inset-x-0 bottom-1 flex justify-center">
                       <span className="text-[8px] font-technical text-foreground/40 text-center leading-tight px-1">{badge.name}</span>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] font-technical text-foreground/30 text-center mt-10">
                {t("inventory.noBadges")}
              </p>
            )}
          </div>
        </div>

        {/* Consumables Box */}
        <div className="bg-surface/30 border border-surface-border flex flex-col chamfered-box">
          <div className="bg-surface border-b border-surface-border p-2">
             <span className="text-[10px] font-technical tracking-widest text-foreground/50 flex items-center gap-2">
               <Hexagon className="w-3 h-3" />
               [{t("inventory.consumables")}]
             </span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {inventoryEntries.length > 0 ? (
              <div className="flex flex-col gap-2">
                {inventoryEntries.map(([itemId, amount]) => (
                  <div key={itemId} className="flex justify-between items-center p-3 border border-surface-border bg-surface/50 hover:border-primary/50 transition-colors">
                     <span className="text-xs font-technical text-foreground uppercase tracking-widest">{itemId.replace(/_/g, " ")}</span>
                     <span className="text-[10px] font-mono text-primary border border-primary/30 px-2 py-0.5">x{amount.toString().padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] font-technical text-foreground/30 text-center mt-10">
                {t("inventory.noItems")}
              </p>
            )}
          </div>
        </div>

        {/* Pets Roster Box */}
        <div className="bg-surface/30 border border-surface-border flex flex-col chamfered-box">
          <div className="bg-surface border-b border-surface-border p-2">
             <span className="text-[10px] font-technical tracking-widest text-foreground/50 flex items-center gap-2">
               <Cpu className="w-3 h-3" />
               [{t("inventory.pets")}]
             </span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {ownedPets && ownedPets.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {ownedPets.map((petId, i) => (
                  <div key={i} className="aspect-square bg-surface border border-surface-border flex flex-col items-center justify-center p-2 relative group hover:border-primary/50 transition-colors">
                     {/* Placeholder for pet sprite in inventory view */}
                     <div className="w-16 h-16 bg-surface-border/30 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors mb-2">
                       <Crosshair className="w-6 h-6 text-foreground/20 group-hover:text-primary transition-colors" />
                     </div>
                     <span className="text-[9px] font-technical text-foreground/50 tracking-widest uppercase">{petId.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] font-technical text-foreground/30 text-center mt-10">
                {t("inventory.noPets")}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
