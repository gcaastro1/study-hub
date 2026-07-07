"use client";

import { useGamification } from "@/context/GamificationContext";
import { BrainCircuit, Clock, Timer, Trophy, Swords, Shield, Shirt } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { RPG_CLASSES, RPGClassId } from "@/lib/rpgClasses";
import { EQUIPMENTS } from "@/app/(app)/store/page";

export default function AnalyticsDashboard() {
  const { stats, isLoaded, unlockedBadges, attributes, rpgClass, equipment } = useGamification();

  if (!isLoaded) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const totalBattles = stats.bossBattlesWon + stats.bossBattlesLost;
  const winRate = totalBattles > 0 
    ? Math.round((stats.bossBattlesWon / totalBattles) * 100) 
    : 0;

  const subjectData = Object.entries(stats.xpPerSubject).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="flex flex-col gap-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">Tempo Focado</p>
            <p className="text-2xl font-bold">{formatTime(stats.totalStudyTime)}</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">Pomodoros</p>
            <p className="text-2xl font-bold">{stats.pomodorosCompleted}</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">Boss Battles</p>
            <p className="text-2xl font-bold">{stats.bossBattlesWon} <span className="text-sm font-normal text-foreground/40">Vitórias</span></p>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-foreground/60 text-sm font-medium">Win Rate</p>
            <p className="text-2xl font-bold">{winRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XP por Matéria (Pie Chart) */}
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BrainCircuit className="text-primary w-5 h-5" />
            XP por Matéria
          </h3>
          
          <div className="flex-1 min-h-[300px]">
            {subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-foreground/40 text-sm">
                Nenhum dado de matéria ainda. Conclua tarefas para ver o gráfico!
              </div>
            )}
          </div>
          
          {subjectData.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {subjectData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-foreground/80">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Win / Loss Bar Chart */}
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Swords className="text-primary w-5 h-5" />
            Desempenho em Batalhas
          </h3>
          
          <div className="flex-1 min-h-[300px]">
            {totalBattles > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Vitórias', value: stats.bossBattlesWon, fill: '#10b981' },
                    { name: 'Derrotas', value: stats.bossBattlesLost, fill: '#ef4444' }
                  ]}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.5)" />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-foreground/40 text-sm">
                Enfrente chefes arrastando tarefas para "Concluído".
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RPG Stats Section */}
      {rpgClass && (
        <div className="mt-4 mb-4">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Swords className="w-6 h-6 text-primary" /> Seus Atributos: {RPG_CLASSES[rpgClass as RPGClassId]?.name}
          </h3>
          <div className="glass-panel p-6 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { subject: 'Força', A: attributes.strength, fullMark: Math.max(10, attributes.strength) },
                  { subject: 'Sabedoria', A: attributes.wisdom, fullMark: Math.max(10, attributes.wisdom) },
                  { subject: 'Carisma', A: attributes.charisma, fullMark: Math.max(10, attributes.charisma) },
                  { subject: 'Destreza', A: attributes.dexterity, fullMark: Math.max(10, attributes.dexterity) },
                ]}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 14 }} />
                  <Radar name="Atributos" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <p className="text-muted-foreground">
                Seus atributos definem o seu estilo de estudo. 
                Cada tarefa e matéria que você conclui fortalece um aspecto do seu personagem.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-4 bg-red-500/10 border-red-500/20">
                  <div className="text-red-400 font-bold mb-1">Força</div>
                  <div className="text-2xl">{attributes.strength}</div>
                </div>
                <div className="glass-panel p-4 bg-blue-500/10 border-blue-500/20">
                  <div className="text-blue-400 font-bold mb-1">Sabedoria</div>
                  <div className="text-2xl">{attributes.wisdom}</div>
                </div>
                <div className="glass-panel p-4 bg-emerald-500/10 border-emerald-500/20">
                  <div className="text-emerald-400 font-bold mb-1">Carisma</div>
                  <div className="text-2xl">{attributes.charisma}</div>
                </div>
                <div className="glass-panel p-4 bg-yellow-500/10 border-yellow-500/20">
                  <div className="text-yellow-400 font-bold mb-1">Destreza</div>
                  <div className="text-2xl">{attributes.dexterity}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Avatar Equipments */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Equipamentos do Avatar
            </h3>
            <div className="glass-panel p-8 flex flex-col md:flex-row items-center justify-center gap-12">
              {/* Paper Doll */}
              <div className="relative w-48 h-64 flex flex-col items-center justify-center bg-black/20 rounded-xl border border-white/5">
                {/* Cabeça */}
                <div className={`absolute top-4 w-16 h-16 rounded-lg border-2 flex items-center justify-center z-20 ${equipment?.head ? 'border-primary bg-primary/20' : 'border-dashed border-white/20 bg-white/5'}`}>
                  {equipment?.head ? (
                    <Shield className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" /> // Fallback icon
                  ) : <span className="text-xs text-white/30">Cabeça</span>}
                </div>
                
                {/* Corpo */}
                <div className={`absolute top-24 w-20 h-28 rounded-lg border-2 flex items-center justify-center z-10 ${equipment?.body ? 'border-primary bg-primary/20' : 'border-dashed border-white/20 bg-white/5'}`}>
                  {equipment?.body ? (
                    <Shirt className="w-10 h-10 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                  ) : <span className="text-xs text-white/30">Corpo</span>}
                </div>

                {/* Arma */}
                <div className={`absolute top-28 -right-8 w-12 h-24 rounded-lg border-2 flex items-center justify-center z-30 ${equipment?.weapon ? 'border-primary bg-primary/20' : 'border-dashed border-white/20 bg-white/5'}`}>
                  {equipment?.weapon ? (
                    <Swords className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                  ) : <span className="text-[10px] text-white/30">Arma</span>}
                </div>
              </div>
              
              <div className="flex flex-col gap-4 max-w-sm">
                <p className="text-foreground/60 text-sm">
                  Seu avatar visual. Compre itens na Loja para equipar nas suas jornadas diárias e ficar mais forte.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-surface-border p-3 rounded text-sm">
                    <span className="text-foreground/50">Cabeça</span>
                    <span className="font-bold text-primary">
                      {equipment?.head ? EQUIPMENTS.find(e => e.id === equipment.head)?.name || "Equipado" : "Vazio"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-border p-3 rounded text-sm">
                    <span className="text-foreground/50">Corpo</span>
                    <span className="font-bold text-primary">
                      {equipment?.body ? EQUIPMENTS.find(e => e.id === equipment.body)?.name || "Equipado" : "Vazio"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-border p-3 rounded text-sm">
                    <span className="text-foreground/50">Arma</span>
                    <span className="font-bold text-primary">
                      {equipment?.weapon ? EQUIPMENTS.find(e => e.id === equipment.weapon)?.name || "Equipada" : "Vazia"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vitrine de Troféus (Badges) */}
      <div className="mt-8 mb-12">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" /> Vitrine de Troféus
        </h3>
        
        {unlockedBadges.length === 0 ? (
          <div className="glass-panel p-8 text-center border-dashed border-primary/30">
            <Trophy className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <p className="text-foreground/50">Você ainda não desbloqueou nenhuma conquista. Continue estudando!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {unlockedBadges.map((badge) => (
              <div 
                key={badge.id}
                className={`glass-panel p-4 flex flex-col items-center text-center border transition-transform hover:scale-105 ${badge.color}`}
              >
                <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center mb-3">
                  <span className="text-3xl">🏆</span>
                </div>
                <h4 className="font-bold text-sm mb-1 text-white">{badge.name}</h4>
                <p className="text-[11px] opacity-80 text-white/80 leading-tight">{badge.description}</p>
                {badge.unlockedAt && (
                  <p className="text-[10px] mt-3 opacity-50 text-white/60">
                    {new Date(badge.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
