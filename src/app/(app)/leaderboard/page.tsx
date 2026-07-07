"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Trophy, Medal, Star, Shield, Swords, Feather, Flame, Hexagon } from "lucide-react";
import { FACTIONS, FactionId } from "@/lib/factions";
import { TITLES } from "@/lib/titles";
import Image from "next/image";
import WorldBossWidget from "@/components/WorldBossWidget";

interface LeaderboardUser {
  id: string;
  name: string | null;
  photoURL: string | null;
  xp: number;
  level: number;
  faction: FactionId | null;
  activeTitle?: string | null;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"players" | "factions">("players");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50));
        const querySnapshot = await getDocs(q);
        
        const fetchedUsers: LeaderboardUser[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedUsers.push({
            id: doc.id,
            name: data.name || "Estudante Anônimo",
            photoURL: data.photoURL || null,
            xp: data.xp || 0,
            level: data.level || 1,
            faction: data.faction || null,
            activeTitle: data.activeTitle || null,
          });
        });
        
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Erro ao carregar leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentUserIndex = users.findIndex(u => u.id === user?.uid);

  const factionScores = { owl: 0, lion: 0, dragon: 0 };
  users.forEach(u => {
    if (u.faction && factionScores[u.faction] !== undefined) {
      factionScores[u.faction] += u.xp;
    }
  });

  const sortedFactions = (Object.keys(FACTIONS) as FactionId[])
    .map(fId => ({
      id: fId,
      score: factionScores[fId],
      data: FACTIONS[fId]
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
      <header className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500">
            <Trophy className="text-yellow-400 w-8 h-8" />
            Hall da Fama
          </h1>
          <p className="text-foreground/60 mt-1">
            Os 50 maiores estudantes do mundo. Será que você consegue o Top 1?
          </p>
        </div>
      </header>

      <WorldBossWidget />

      {/* Tabs */}
      <div className="flex bg-black/20 rounded-xl p-1 mb-2">
        <button
          onClick={() => setActiveTab("players")}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex justify-center items-center gap-2 ${
            activeTab === "players" ? "bg-primary text-white shadow-lg" : "text-foreground/50 hover:text-foreground"
          }`}
        >
          <Trophy className="w-4 h-4" /> Top Alunos
        </button>
        <button
          onClick={() => setActiveTab("factions")}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex justify-center items-center gap-2 ${
            activeTab === "factions" ? "bg-primary text-white shadow-lg" : "text-foreground/50 hover:text-foreground"
          }`}
        >
          <Swords className="w-4 h-4" /> Guerra de Guildas
        </button>
      </div>

      {activeTab === "players" && currentUserIndex !== -1 && (
        <div className="glass-panel p-4 bg-primary/10 border-primary/30 flex items-center justify-between rounded-xl">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-medium">Sua Posição:</span>
          </div>
          <div className="text-xl font-black text-primary">
            #{currentUserIndex + 1}
          </div>
        </div>
      )}

      <div className="glass-panel overflow-hidden">
        <div className="flex flex-col">
          {activeTab === "players" ? (
            users.map((u, index) => {
              const isCurrentUser = u.id === user?.uid;
              const UserFactionIcon = u.faction ? (
                u.faction === "owl" ? Feather :
                u.faction === "lion" ? Flame : Hexagon
              ) : null;
              
              let RankIcon = null;
              let rankColor = "text-foreground/40";
              
              if (index === 0) {
                RankIcon = Trophy;
                rankColor = "text-yellow-400";
              } else if (index === 1) {
                RankIcon = Medal;
                rankColor = "text-slate-300";
              } else if (index === 2) {
                RankIcon = Medal;
                rankColor = "text-amber-600";
              }

              return (
                <div 
                  key={u.id}
                  className={`flex items-center p-4 border-b border-surface-border last:border-0 transition-colors ${
                    isCurrentUser ? "bg-primary/5" : "hover:bg-white/5"
                  }`}
                >
                  <div className={`w-12 text-center font-bold text-lg ${rankColor}`}>
                    {RankIcon ? <RankIcon className="w-6 h-6 mx-auto" /> : `#${index + 1}`}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-surface-border overflow-hidden mx-4 flex-shrink-0 flex items-center justify-center relative">
                    {u.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.photoURL} alt={u.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-foreground/40">{u.name?.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {u.name} {isCurrentUser && "(Você)"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-foreground/50">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" /> Nv. {u.level}
                      </span>
                      {UserFactionIcon && (
                        <>
                          <span className="opacity-50">•</span>
                          <span className={`flex items-center gap-1 ${FACTIONS[u.faction!]?.color}`}>
                            <UserFactionIcon className="w-3 h-3" /> {FACTIONS[u.faction!]?.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {u.xp.toLocaleString()} XP
                  </div>
                </div>
              );
            })
          ) : (
            sortedFactions.map((f, index) => {
              const FactionIcon = f.id === "owl" ? Feather :
                                  f.id === "lion" ? Flame : Hexagon;
              
              let RankIcon = null;
              if (index === 0) RankIcon = Trophy;
              else if (index === 1) RankIcon = Medal;
              else RankIcon = Medal;

              return (
                <div 
                  key={f.id}
                  className={`flex flex-col md:flex-row items-center p-6 border-b border-surface-border last:border-0 transition-colors ${f.data.bgColor} hover:brightness-110`}
                >
                  <div className={`w-16 text-center font-bold text-2xl ${index === 0 ? "text-yellow-400" : "text-foreground/40"}`}>
                    {RankIcon ? <RankIcon className="w-8 h-8 mx-auto" /> : `#${index + 1}`}
                  </div>
                  
                  <div className={`p-4 rounded-full bg-black/20 mx-6`}>
                    <FactionIcon className={`w-10 h-10 ${f.data.color}`} />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left my-4 md:my-0">
                    <h3 className={`font-black text-2xl ${f.data.color}`}>
                      {f.data.name}
                    </h3>
                    <p className="text-sm text-foreground/60 mt-1">{f.data.description}</p>
                  </div>
                  
                  <div className="text-center md:text-right ml-4">
                    <div className="text-sm text-foreground/50 uppercase tracking-widest font-bold mb-1">XP Total da Guilda</div>
                    <div className="font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                      {f.score.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {activeTab === "players" && users.length === 0 && (
            <div className="p-8 text-center text-foreground/50">
              Nenhum usuário encontrado ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
