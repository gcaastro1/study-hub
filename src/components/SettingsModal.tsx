"use client";

import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { X, LogOut, Settings2, Globe } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { logout } = useAuth();
  const { language, setLanguage, t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className="bg-background border-2 border-surface-border w-full max-w-md relative flex flex-col">
        
        {/* Header */}
        <div className="bg-primary text-white p-3 border-b border-surface-border flex justify-between items-center chamfered-box">
          <h2 className="text-sm font-technical font-bold flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            {t("settings.title")}
          </h2>
          <button onClick={onClose} className="hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-8">
          
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-technical tracking-widest text-foreground/50 flex items-center gap-2">
              <Globe className="w-3 h-3" />
              {t("settings.language")}
            </span>
            <div className="flex border border-surface-border p-1 bg-surface/50">
              <button 
                onClick={() => setLanguage("pt")}
                className={`flex-1 py-2 text-xs font-technical tracking-widest transition-colors ${
                  language === "pt" ? "bg-primary text-white font-bold" : "text-foreground/50 hover:text-foreground"
                }`}
              >
                [ PT-BR ]
              </button>
              <button 
                onClick={() => setLanguage("en")}
                className={`flex-1 py-2 text-xs font-technical tracking-widest transition-colors ${
                  language === "en" ? "bg-primary text-white font-bold" : "text-foreground/50 hover:text-foreground"
                }`}
              >
                [ EN-US ]
              </button>
            </div>
          </div>

          <div className="border-t border-surface-border pt-6">
            <button 
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-3 border border-red-500/50 text-red-500 hover:bg-red-500/10 font-technical text-sm tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("settings.logout")}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
