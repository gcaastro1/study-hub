import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { checkNewTitles, TITLES } from '@/lib/titles';
import { getAttributeGainsForSubject } from '@/lib/constants';
import { playLevelUp } from '@/lib/audio';
import { RPG_CLASSES, RPGClassId } from '@/lib/rpgClasses';

export interface SetClassPayload {
  classId: string;
  attributes: { strength: number; wisdom: number; charisma: number; dexterity: number };
}

export interface Stats {
  totalStudyTime: number;
  pomodorosCompleted: number;
  bossBattlesWon: number;
  bossBattlesLost: number;
  xpPerSubject: Record<string, number>;
}

export const defaultStats: Stats = {
  totalStudyTime: 0,
  pomodorosCompleted: 0,
  bossBattlesWon: 0,
  bossBattlesLost: 0,
  xpPerSubject: {},
};

interface PlayerState {
  xp: number;
  level: number;
  coins: number;
  streakLogs: string[];
  stats: Stats;
  activeBoosts: Record<string, string>;
  rpgClass: string | null;
  attributes: { strength: number; wisdom: number; charisma: number; dexterity: number };
  faction: string | null;
  dailyDungeonCleared: string | null;
  activeTitle: string | null;
  unlockedTitles: string[];
  isLoaded: boolean;
}

const initialState: PlayerState = {
  xp: 0,
  level: 1,
  coins: 0,
  streakLogs: [],
  stats: defaultStats,
  activeBoosts: {},
  rpgClass: null,
  attributes: { strength: 0, wisdom: 0, charisma: 0, dexterity: 0 },
  faction: null,
  dailyDungeonCleared: null,
  activeTitle: null,
  unlockedTitles: [],
  isLoaded: false,
};

export const fetchPlayerData = createAsyncThunk(
  'player/fetchData',
  async (uid: string) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  }
);

export const selectClass = createAsyncThunk(
  'player/selectClass',
  async ({ uid, classId }: { uid: string, classId: string }, { dispatch }) => {
    const selectedClass = RPG_CLASSES[classId as RPGClassId];
    if (!selectedClass) throw new Error("Classe não encontrada");
    
    // Optimistic update
    dispatch(playerSlice.actions.setClassLocal({ classId, attributes: selectedClass.baseAttributes }));
    
    const docRef = doc(db, 'users', uid);
    try {
      await setDoc(docRef, {
        rpgClass: classId,
        attributes: selectedClass.baseAttributes
      }, { merge: true });
    } catch (error) {
      console.warn("Offline: failed to save class to Firebase, but applied locally.", error);
    }
    
    return { classId, attributes: selectedClass.baseAttributes };
  }
);

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayerLoaded: (state, action: PayloadAction<boolean>) => {
      state.isLoaded = action.payload;
    },
    resetPlayer: () => initialState,
    addXpLocal: (state, action: PayloadAction<{ xp: number, coins: number, level: number, attributes: any }>) => {
      state.xp = action.payload.xp;
      state.coins = action.payload.coins;
      state.level = action.payload.level;
      state.attributes = action.payload.attributes;
    },
    updateStatsLocal: (state, action: PayloadAction<Partial<Stats>>) => {
      const updates = action.payload;
      if (updates.totalStudyTime) state.stats.totalStudyTime += updates.totalStudyTime;
      if (updates.pomodorosCompleted) state.stats.pomodorosCompleted += updates.pomodorosCompleted;
      if (updates.bossBattlesWon) state.stats.bossBattlesWon += updates.bossBattlesWon;
      if (updates.bossBattlesLost) state.stats.bossBattlesLost += updates.bossBattlesLost;
      if (updates.xpPerSubject) {
        Object.entries(updates.xpPerSubject).forEach(([subject, amount]) => {
          state.stats.xpPerSubject[subject] = (state.stats.xpPerSubject[subject] || 0) + amount;
        });
      }
    },
    unlockTitlesLocal: (state, action: PayloadAction<string[]>) => {
      state.unlockedTitles = [...state.unlockedTitles, ...action.payload];
    },
    equipTitleLocal: (state, action: PayloadAction<string | null>) => {
      state.activeTitle = action.payload;
    },
    addStreakLocal: (state, action: PayloadAction<string>) => {
      if (!state.streakLogs.includes(action.payload)) {
        state.streakLogs.push(action.payload);
      }
    },
    clearDungeonLocal: (state, action: PayloadAction<string>) => {
      state.dailyDungeonCleared = action.payload;
    },
    spendCoinsLocal: (state, action: PayloadAction<number>) => {
      state.coins -= action.payload;
    },
    activateBoostLocal: (state, action: PayloadAction<{ boostId: string, expiry: string }>) => {
      state.activeBoosts[action.payload.boostId] = action.payload.expiry;
    },
    setFactionLocal: (state, action: PayloadAction<string>) => {
      state.faction = action.payload;
    },
    setClassLocal: (state, action: PayloadAction<SetClassPayload>) => {
      state.rpgClass = action.payload.classId;
      state.attributes = action.payload.attributes;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPlayerData.fulfilled, (state, action) => {
      if (action.payload) {
        const data = action.payload;
        state.xp = data.xp || 0;
        state.level = data.level || 1;
        state.coins = data.coins ?? (data.xp || 0);
        state.streakLogs = data.streakLogs || [];
        state.stats = data.stats || defaultStats;
        state.activeBoosts = data.activeBoosts || {};
        state.rpgClass = data.rpgClass || null;
        state.faction = data.faction || null;
        state.dailyDungeonCleared = data.dailyDungeonCleared || null;
        state.attributes = data.attributes || { strength: 0, wisdom: 0, charisma: 0, dexterity: 0 };
        state.activeTitle = data.activeTitle || null;
        state.unlockedTitles = data.unlockedTitles || [];
      }
      state.isLoaded = true;
    });
    builder.addCase(fetchPlayerData.rejected, (state) => {
      state.isLoaded = true;
    });
    builder.addCase(selectClass.fulfilled, (state, action) => {
      state.rpgClass = action.payload.classId;
      state.attributes = action.payload.attributes;
    });
  }
});

export const { setPlayerLoaded, resetPlayer, addXpLocal, updateStatsLocal, unlockTitlesLocal, equipTitleLocal, addStreakLocal, clearDungeonLocal, spendCoinsLocal, activateBoostLocal, setFactionLocal, setClassLocal } = playerSlice.actions;
export default playerSlice.reducer;

// Thunks complexos que afetam múltiplos slices (como ganhar XP, que afeta stats, badges e drops) ficarão em actions separadas no store, ou usaremos dispatch de actions locais enquanto damos um setDoc no Firebase.
