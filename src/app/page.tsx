"use client";

import { useAuth } from "@/context/AuthContext";
import { Brain, Swords, Trophy, Sparkles, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  // Se já estiver logado, manda direto pro app
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="w-full px-6 py-6 md:px-12 flex items-center justify-between z-10 border-b border-surface-border bg-surface/50 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Study Hub <span className="text-sm opacity-50">V3</span>
          </span>
        </div>
        <button 
          onClick={signInWithGoogle}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-primary/20"
        >
          Entrar
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] opacity-50"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] opacity-50"></div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-surface-border text-sm font-medium mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          O RPG dos seus estudos
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 max-w-4xl leading-tight">
          Transforme sua rotina em uma <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Jornada Épica</span>
        </h1>
        
        <p className="text-xl text-foreground/70 mb-10 max-w-2xl">
          Ganhe XP, derrote chefes, compita com o mundo inteiro e evolua seu cérebro de verdade usando IA e Flashcards.
        </p>
        
        <button 
          onClick={signInWithGoogle}
          className="bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-full font-black text-lg transition-transform hover:scale-105 shadow-2xl shadow-white/10 flex items-center gap-3"
        >
          Começar Aventura Gratuitamente
        </button>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full text-left">
          <div className="glass-panel p-6 border-primary/20 hover:border-primary/50 transition-colors">
            <Swords className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Batalhas de Chefes</h3>
            <p className="text-foreground/70 text-sm">
              Conclua suas tarefas e enfrente desafios gerados por IA. Acerte e ganhe recompensas absurdas!
            </p>
          </div>
          
          <div className="glass-panel p-6 border-emerald-500/20 hover:border-emerald-500/50 transition-colors">
            <BookOpen className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Repetição Espaçada</h3>
            <p className="text-foreground/70 text-sm">
              O algoritmo SM-2 garante que você nunca mais vai esquecer o que estudou. Revise flashcards no momento certo.
            </p>
          </div>

          <div className="glass-panel p-6 border-yellow-400/20 hover:border-yellow-400/50 transition-colors">
            <Trophy className="w-10 h-10 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Conquistas e Ranking</h3>
            <p className="text-foreground/70 text-sm">
              Colecione insígnias incríveis, ganhe poções na loja e alcance o Top 1 do Leaderboard Global!
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-foreground/50 text-sm border-t border-surface-border">
        © {new Date().getFullYear()} Study Hub. Construído com magia e código.
      </footer>
    </div>
  );
}
