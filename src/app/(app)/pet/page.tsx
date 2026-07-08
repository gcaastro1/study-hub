"use client";

import { useState, useEffect } from "react";
import { Heart, Droplet, Star, Crown, Lock, Store } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store";
import SpriteAnimator from "@/components/SpriteAnimator";
import { PET_SPECIES, getActiveEvolution, PetSpecies } from "@/lib/pets";
import { equipPetThunk, buyPetThunk } from "@/store/thunks";
import { useAuth } from "@/context/AuthContext";

export default function PetSanctuaryPage() {
  const { level, dailyDungeonCleared, coins } = useAppSelector(state => state.player);
  const { ownedPets, activePetId } = useAppSelector(state => state.inventory);
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  const [petLevel, setPetLevel] = useState(1);
  const [affection, setAffection] = useState(50);
  const [isAttacking, setIsAttacking] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  useEffect(() => {
    // Pet level scales with user level
    setPetLevel(Math.max(1, Math.floor(level / 2)));
    
    // Affection logic
    const today = new Date().toISOString().split("T")[0];
    if (dailyDungeonCleared === today) {
      setAffection(100);
    } else {
      setAffection(50);
    }
  }, [level, dailyDungeonCleared]);

  const handlePetClick = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 1000);
  };

  const handleEquip = async (petId: string) => {
    if (!user || loadingAction) return;
    setLoadingAction(`equip-${petId}`);
    try {
      await dispatch(equipPetThunk({ uid: user.uid, petId }));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBuy = async (pet: PetSpecies) => {
    if (!user || loadingAction) return;
    if (coins < pet.price) {
      alert("Você não tem moedas suficientes!");
      return;
    }
    
    if (confirm(`Deseja adotar ${pet.name} por ${pet.price} moedas?`)) {
      setLoadingAction(`buy-${pet.id}`);
      try {
        await dispatch(buyPetThunk({ uid: user.uid, petId: pet.id }));
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const petStatus = affection > 80 ? "Muito Feliz" : affection > 30 ? "Satisfeito" : "Triste";
  
  // Active Pet info
  const activeSpeciesId = activePetId || "gato_planta";
  const activeSpecies = PET_SPECIES[activeSpeciesId];
  const activeEvolution = getActiveEvolution(activeSpeciesId, petLevel);
  const spriteSrc = `/mascots/sprites/${activeEvolution.id}_${isAttacking ? 'attack' : 'idle'}.png`;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col gap-8 pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
            <Crown className="text-emerald-400 w-8 h-8" />
            Santuário de Mascotes
          </h1>
          <p className="text-foreground/60 mt-1">
            Colecione, cuide e evolua seus companheiros mágicos.
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold px-4 py-2 rounded-full flex items-center gap-2">
          <Store className="w-4 h-4" />
          {coins} Moedas
        </div>
      </header>

      {/* Active Pet Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 flex flex-col items-center justify-center relative min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-xl" />
          
          <div className="relative w-64 h-64 mb-8">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative w-full h-full flex justify-center items-center">
              <SpriteAnimator 
                src={spriteSrc} 
                className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-110 transition-transform cursor-pointer"
                onClick={handlePetClick}
                frameCount={4}
                fps={8}
              />
            </div>
            
            {affection > 80 && (
              <div className="absolute -top-4 -right-4 animate-bounce">
                <Heart className="w-8 h-8 text-red-400 fill-red-400" />
              </div>
            )}
            {affection <= 30 && (
              <div className="absolute -top-4 -right-4 animate-pulse">
                <Droplet className="w-8 h-8 text-blue-400 fill-blue-400" />
              </div>
            )}
          </div>
          
          <div className="text-center z-10">
            <h2 className="text-2xl font-black mb-1">{activeEvolution.name}</h2>
            <div className="flex items-center justify-center gap-2 text-foreground/60 mb-4">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>Nível {petLevel}</span>
              <span className="mx-2">•</span>
              <span className={affection > 80 ? "text-emerald-400 font-bold" : ""}>
                {petStatus}
              </span>
            </div>
            <p className="text-sm text-foreground/70 max-w-xs">{activeSpecies.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Afeição
            </h3>
            <div className="h-4 bg-surface-border rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-1000"
                style={{ width: `${affection}%` }}
              />
            </div>
            <p className="text-sm text-foreground/50">
              Complete a Masmorra Diária para manter a afeição do seu mascote em 100%.
            </p>
          </div>

          <div className="glass-panel p-6 flex-1">
            <h3 className="text-lg font-bold mb-4">Linha Evolutiva</h3>
            <p className="text-foreground/60 mb-6 text-sm">
              Os mascotes crescem conforme o seu Nível aumenta. Formas mais fortes são liberadas em níveis altos!
            </p>

            <div className="space-y-4">
              {activeSpecies.evolutions.map((evo) => {
                const isActiveEvo = activeEvolution.id === evo.id;
                const isUnlockedEvo = petLevel >= evo.requiredLevel;
                
                return (
                  <div key={evo.id} className={`p-4 rounded-lg border flex items-center justify-between ${isUnlockedEvo ? 'bg-primary/10 border-primary/30' : 'bg-surface-border border-transparent opacity-50'}`}>
                    <span className="font-bold flex items-center gap-2">
                      {!isUnlockedEvo && <Lock className="w-4 h-4" />}
                      {evo.name}
                    </span>
                    {isActiveEvo ? (
                      <span className="text-primary text-sm font-bold">Ativo</span>
                    ) : (
                      <span className="text-sm">Nv. {evo.requiredLevel}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pet Collection & Store */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 mt-4">
          <Store className="w-6 h-6 text-amber-500" />
          Coleção & Adoção
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(PET_SPECIES).map((pet) => {
            const isOwned = ownedPets?.includes(pet.id) || pet.price === 0; // fallback if ownedPets empty
            const isEquipped = activeSpeciesId === pet.id;
            const currentEvo = getActiveEvolution(pet.id, petLevel);

            return (
              <div key={pet.id} className={`glass-panel p-5 flex flex-col items-center text-center transition-all ${isEquipped ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-white/5'}`}>
                <div className="w-20 h-20 relative mb-4">
                  {isOwned ? (
                    <SpriteAnimator 
                      src={`/mascots/sprites/${currentEvo.id}_idle.png`} 
                      className="w-full h-full drop-shadow-md"
                      frameCount={4}
                      fps={6}
                    />
                  ) : (
                    <div className="w-full h-full bg-black/50 rounded-full flex items-center justify-center grayscale opacity-50">
                      <Lock className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                </div>
                <h4 className="font-bold">{isOwned ? currentEvo.name : pet.name}</h4>
                <p className="text-xs text-foreground/60 mt-1 mb-4 line-clamp-2 h-8">{pet.description}</p>
                
                {isEquipped ? (
                  <button disabled className="w-full py-2 rounded-lg bg-primary/20 text-primary font-bold text-sm">
                    Equipado
                  </button>
                ) : isOwned ? (
                  <button 
                    onClick={() => handleEquip(pet.id)}
                    disabled={loadingAction === `equip-${pet.id}`}
                    className="w-full py-2 rounded-lg bg-surface-border hover:bg-surface-border/80 text-foreground font-bold text-sm transition-colors"
                  >
                    Equipar
                  </button>
                ) : (
                  <button 
                    onClick={() => handleBuy(pet)}
                    disabled={loadingAction === `buy-${pet.id}` || coins < pet.price}
                    className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Store className="w-4 h-4" /> {pet.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
