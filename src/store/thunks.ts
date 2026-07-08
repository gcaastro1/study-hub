import { createAsyncThunk } from '@reduxjs/toolkit';
import { doc, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RootState } from './index';
import { addXpLocal, updateStatsLocal, addStreakLocal, spendCoinsLocal, clearDungeonLocal, unlockTitlesLocal, equipTitleLocal, activateBoostLocal, setFactionLocal } from './slices/playerSlice';
import { addItemLocal, useItemLocal, equipThemeLocal, unlockThemeLocal, equipItemLocal, updateAvatarConfigLocal, unlockAvatarItemLocal, addBadgeLocal, equipPetLocal, unlockPetLocal } from './slices/inventorySlice';
import { checkBadges, Badge } from '@/lib/badges';
import { checkNewTitles, TITLES } from '@/lib/titles';
import { playDrop, playLevelUp, playBuy } from '@/lib/audio';
import { getAttributeGainsForSubject } from '@/lib/constants';
import { AvatarConfig } from '@/lib/avatar';
import { PET_SPECIES } from '@/lib/pets';

// Helper thunk to process badges internally
export const processBadgesThunk = createAsyncThunk(
  'gamification/processBadges',
  async ({ uid, currentXp, actionType, actionPayload }: { uid: string, currentXp: number, actionType?: string, actionPayload?: any }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const stats = state.player.stats;
    const unlockedBadges = state.inventory.unlockedBadges;
    
    const newBadges = checkBadges(
      stats,
      currentXp,
      unlockedBadges.map(b => b.id),
      { type: actionType || "GENERAL", payload: actionPayload }
    );

    if (newBadges.length > 0) {
      dispatch(addBadgeLocal(newBadges));
      
      const docRef = doc(db, "users", uid);
      const updatedBadges = [...unlockedBadges, ...newBadges];
      await setDoc(docRef, { unlockedBadges: updatedBadges }, { merge: true });
      
      newBadges.forEach(b => {
        alert(`🏆 Conquista Desbloqueada: ${b.name}!\n${b.description}`);
      });
    }
  }
);

export const updateStatsThunk = createAsyncThunk(
  'gamification/updateStats',
  async ({ uid, updates, actionType, actionPayload }: { uid: string, updates: any, actionType?: string, actionPayload?: any }, { getState, dispatch }) => {
    dispatch(updateStatsLocal(updates));
    
    const state = getState() as RootState;
    const newStats = state.player.stats; // after local update
    const xp = state.player.xp;
    
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { stats: newStats }, { merge: true });
    
    const unlockedTitles = state.player.unlockedTitles;
    const newEarnedTitles = checkNewTitles(newStats, unlockedTitles);
    
    if (newEarnedTitles.length > 0) {
      dispatch(unlockTitlesLocal(newEarnedTitles));
      const updatedTitles = [...unlockedTitles, ...newEarnedTitles];
      await setDoc(docRef, { unlockedTitles: updatedTitles }, { merge: true });
      
      newEarnedTitles.forEach(tId => {
        const tData = TITLES.find(t => t.id === tId);
        if (tData) {
          alert(`📜 Novo Título Desbloqueado: ${tData.name}!\n${tData.description}`);
        }
      });
    }
    
    dispatch(processBadgesThunk({ uid, currentXp: xp, actionType, actionPayload }));
  }
);

export const addXpThunk = createAsyncThunk(
  'gamification/addXp',
  async ({ uid, amount, subject, actionType, actionPayload }: { uid: string, amount: number, subject?: string, actionType?: string, actionPayload?: any }, { getState, dispatch }) => {
    const state = getState() as RootState;
    let finalAmount = amount;
    
    const doubleXpExpiry = state.player.activeBoosts["double_xp"];
    if (doubleXpExpiry && new Date(doubleXpExpiry) > new Date()) {
      finalAmount *= 2;
    }
    
    const oldXp = state.player.xp;
    const newXp = oldXp + finalAmount;
    const newCoins = state.player.coins + finalAmount;
    
    let newLevel = state.player.level;
    if (Math.floor(newXp / 500) + 1 > newLevel) {
      newLevel = Math.floor(newXp / 500) + 1;
      playLevelUp();
    }
    
    const today = new Date().toISOString().split("T")[0];
    dispatch(addStreakLocal(today));
    
    let attrGain = { strength: 0, wisdom: 0, charisma: 0, dexterity: 0 };
    if (subject) {
      attrGain = getAttributeGainsForSubject(subject);
    }
    if (actionType === "POMODORO") {
      attrGain.dexterity += 1;
    }
    
    const oldAttributes = state.player.attributes;
    const newAttributes = {
      strength: oldAttributes.strength + attrGain.strength,
      wisdom: oldAttributes.wisdom + attrGain.wisdom,
      charisma: oldAttributes.charisma + attrGain.charisma,
      dexterity: oldAttributes.dexterity + attrGain.dexterity,
    };
    
    dispatch(addXpLocal({ xp: newXp, coins: newCoins, level: newLevel, attributes: newAttributes }));
    
    if (subject) {
      dispatch(updateStatsThunk({ uid, updates: { xpPerSubject: { [subject]: finalAmount } }, actionType, actionPayload }));
    } else {
      dispatch(processBadgesThunk({ uid, currentXp: newXp, actionType, actionPayload }));
    }
    
    // Drop
    let dropMsg = "";
    const currentInventory = state.inventory.inventory;
    const newInventory = { ...currentInventory };
    if (Math.random() < 0.15) {
      const materials = ["iron_fragment", "magic_crystal", "leather_scrap"];
      const dropped = materials[Math.floor(Math.random() * materials.length)];
      newInventory[dropped] = (newInventory[dropped] || 0) + 1;
      dispatch(addItemLocal({ itemId: dropped, amount: 1 }));
      
      const matNames: Record<string, string> = {
        iron_fragment: "Fragmento de Ferro",
        magic_crystal: "Cristal Mágico",
        leather_scrap: "Pedaço de Couro",
      };
      dropMsg = `\nVocê encontrou 1x ${matNames[dropped]}!`;
      playDrop();
    }
    
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, {
      xp: newXp,
      coins: newCoins,
      level: newLevel,
      streakLogs: arrayUnion(today),
      attributes: newAttributes,
      inventory: newInventory
    }, { merge: true });
    
    if (dropMsg) alert(dropMsg);
    
    try {
      const bossRef = doc(db, "server", "world_boss");
      await updateDoc(bossRef, { hp: increment(-10) });
    } catch (e) {
      console.error(e);
    }
  }
);

export const buyThemeThunk = createAsyncThunk(
  'gamification/buyTheme',
  async ({ uid, themeId, cost }: { uid: string, themeId: string, cost: number }, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (state.player.coins < cost || state.inventory.unlockedThemes.includes(themeId)) return false;
    
    dispatch(spendCoinsLocal(cost));
    dispatch(unlockThemeLocal(themeId));
    
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { 
      coins: state.player.coins - cost,
      unlockedThemes: arrayUnion(themeId)
    }, { merge: true });
    
    playBuy();
    return true;
  }
);

export const buyItemThunk = createAsyncThunk(
  'gamification/buyItem',
  async ({ uid, itemId, cost }: { uid: string, itemId: string, cost: number }, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (state.player.coins < cost) return false;
    
    dispatch(spendCoinsLocal(cost));
    dispatch(addItemLocal({ itemId, amount: 1 }));
    
    const newInventory = { ...state.inventory.inventory };
    newInventory[itemId] = (newInventory[itemId] || 0) + 1;
    
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { coins: state.player.coins - cost, inventory: newInventory }, { merge: true });
    
    playBuy();
    return true;
  }
);

export const activateItemThunk = createAsyncThunk(
  'gamification/activateItem',
  async ({ uid, itemId, durationHours }: { uid: string, itemId: string, durationHours: number }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const inventory = state.inventory.inventory;
    
    if (!inventory[itemId] || inventory[itemId] <= 0) return false;
    
    dispatch(useItemLocal(itemId));
    
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + durationHours);
    const expiry = expiryDate.toISOString();
    
    dispatch(activateBoostLocal({ boostId: itemId, expiry }));
    
    const newInventory = { ...inventory };
    newInventory[itemId] -= 1;
    if (newInventory[itemId] === 0) delete newInventory[itemId];
    
    const newBoosts = { ...state.player.activeBoosts, [itemId]: expiry };
    
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { inventory: newInventory, activeBoosts: newBoosts }, { merge: true });
    
    return true;
  }
);

export const equipThemeThunk = createAsyncThunk(
  'gamification/equipTheme',
  async ({ uid, themeId }: { uid: string, themeId: string }, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (!state.inventory.unlockedThemes.includes(themeId)) return;
    
    dispatch(equipThemeLocal(themeId));
    
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { equippedTheme: themeId }, { merge: true });
  }
);

export const clearDungeonThunk = createAsyncThunk(
  'gamification/clearDungeon',
  async (uid: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const today = new Date().toISOString().split("T")[0];
    if (state.player.dailyDungeonCleared === today) return;
    
    dispatch(clearDungeonLocal(today));
    
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { dailyDungeonCleared: today }, { merge: true });
  }
);

export const equipItemThunk = createAsyncThunk(
  'gamification/equipItem',
  async ({ uid, slot, itemId }: { uid: string, slot: 'head'|'body'|'weapon', itemId: string | null }, { getState, dispatch }) => {
    dispatch(equipItemLocal({ slot, itemId }));
    
    const state = getState() as RootState;
    const newEquipment = state.inventory.equipment; // This gets the old state, wait...
    // local dispatch is synchronous, so state is updated in the next getState() call maybe?
    // In Redux Toolkit async thunks, getState() reflects changes after synchronous dispatches.
    
    const nextState = getState() as RootState;
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { equipment: nextState.inventory.equipment }, { merge: true });
  }
);

export const equipTitleThunk = createAsyncThunk(
  'gamification/equipTitle',
  async ({ uid, titleId }: { uid: string, titleId: string | null }, { dispatch }) => {
    dispatch(equipTitleLocal(titleId));
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { activeTitle: titleId }, { merge: true });
  }
);

export const updateAvatarConfigThunk = createAsyncThunk(
  'gamification/updateAvatarConfig',
  async ({ uid, config }: { uid: string, config: Partial<AvatarConfig> }, { getState, dispatch }) => {
    dispatch(updateAvatarConfigLocal(config));
    const state = getState() as RootState;
    
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { avatarConfig: state.inventory.avatarConfig }, { merge: true });
  }
);

export const selectFactionThunk = createAsyncThunk(
  'gamification/selectFaction',
  async ({ uid, factionId }: { uid: string, factionId: string }, { dispatch }) => {
    dispatch(setFactionLocal(factionId));
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { faction: factionId }, { merge: true });
  }
);

export const buyAvatarItemThunk = createAsyncThunk(
  'gamification/buyAvatarItem',
  async ({ uid, itemId, cost }: { uid: string, itemId: string, cost: number }, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (state.player.coins < cost || state.inventory.unlockedAvatarItems.includes(itemId)) return false;
    
    dispatch(spendCoinsLocal(cost));
    dispatch(unlockAvatarItemLocal(itemId));
    
    const newUnlocked = [...state.inventory.unlockedAvatarItems, itemId];
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { 
      coins: state.player.coins - cost,
      unlockedAvatarItems: newUnlocked
    }, { merge: true });
    
    playBuy();
    return true;
  }
);

export const equipPetThunk = createAsyncThunk(
  'inventory/equipPet',
  async ({ uid, petId }: { uid: string, petId: string }, { dispatch }) => {
    // Optimistic update
    dispatch(equipPetLocal(petId));
    
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, { activePetId: petId }, { merge: true });
  }
);

export const buyPetThunk = createAsyncThunk(
  'gamification/buyPet',
  async ({ uid, petId }: { uid: string, petId: string }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const pet = PET_SPECIES[petId];
    if (!pet) throw new Error("Pet não encontrado");
    if (state.player.coins < pet.price) throw new Error("Moedas insuficientes");
    if (state.inventory.ownedPets.includes(petId)) throw new Error("Você já possui este pet");

    // Optimistic updates
    dispatch(spendCoinsLocal(pet.price));
    dispatch(unlockPetLocal(petId));

    try {
      playBuy();
    } catch (e) {}

    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, { 
      coins: increment(-pet.price),
      ownedPets: arrayUnion(petId)
    }, { merge: true });
  }
);
