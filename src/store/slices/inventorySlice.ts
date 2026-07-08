import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AvatarConfig, DEFAULT_AVATAR } from '@/lib/avatar';
import { Badge } from '@/lib/badges';

interface InventoryState {
  inventory: Record<string, number>;
  unlockedThemes: string[];
  equippedTheme: string;
  unlockedBadges: Badge[];
  equipment: { head: string | null; body: string | null; weapon: string | null };
  avatarConfig: AvatarConfig;
  unlockedAvatarItems: string[];
  ownedPets: string[];
  activePetId: string | null;
  isLoaded: boolean;
}

const initialState: InventoryState = {
  inventory: {},
  unlockedThemes: ["default"],
  equippedTheme: "default",
  unlockedBadges: [],
  equipment: { head: null, body: null, weapon: null },
  avatarConfig: DEFAULT_AVATAR,
  unlockedAvatarItems: [],
  ownedPets: ["gato_planta"], // Starter pet
  activePetId: "gato_planta",
  isLoaded: false,
};

export const fetchInventoryData = createAsyncThunk(
  'inventory/fetchData',
  async (uid: string) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    resetInventory: () => initialState,
    addBadgeLocal: (state, action: PayloadAction<Badge[]>) => {
      state.unlockedBadges = [...state.unlockedBadges, ...action.payload];
    },
    equipThemeLocal: (state, action: PayloadAction<string>) => {
      state.equippedTheme = action.payload;
    },
    unlockThemeLocal: (state, action: PayloadAction<string>) => {
      if (!state.unlockedThemes.includes(action.payload)) {
        state.unlockedThemes.push(action.payload);
      }
    },
    addItemLocal: (state, action: PayloadAction<{ itemId: string, amount: number }>) => {
      const { itemId, amount } = action.payload;
      state.inventory[itemId] = (state.inventory[itemId] || 0) + amount;
    },
    useItemLocal: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      if (state.inventory[itemId]) {
        state.inventory[itemId] -= 1;
        if (state.inventory[itemId] <= 0) {
          delete state.inventory[itemId];
        }
      }
    },
    equipItemLocal: (state, action: PayloadAction<{ slot: 'head' | 'body' | 'weapon', itemId: string | null }>) => {
      state.equipment[action.payload.slot] = action.payload.itemId;
    },
    updateAvatarConfigLocal: (state, action: PayloadAction<Partial<AvatarConfig>>) => {
      state.avatarConfig = { ...state.avatarConfig, ...action.payload };
    },
    unlockAvatarItemLocal: (state, action: PayloadAction<string>) => {
      if (!state.unlockedAvatarItems.includes(action.payload)) {
        state.unlockedAvatarItems.push(action.payload);
      }
    },
    equipPetLocal: (state, action: PayloadAction<string>) => {
      if (state.ownedPets.includes(action.payload)) {
        state.activePetId = action.payload;
      }
    },
    unlockPetLocal: (state, action: PayloadAction<string>) => {
      if (!state.ownedPets.includes(action.payload)) {
        state.ownedPets.push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchInventoryData.fulfilled, (state, action) => {
      if (action.payload) {
        const data = action.payload;
        state.unlockedThemes = data.unlockedThemes || ["default"];
        state.equippedTheme = data.equippedTheme || "default";
        state.unlockedBadges = data.unlockedBadges || [];
        state.inventory = data.inventory || {};
        state.equipment = data.equipment || { head: null, body: null, weapon: null };
        state.avatarConfig = data.avatarConfig || DEFAULT_AVATAR;
        state.unlockedAvatarItems = data.unlockedAvatarItems || [];
        state.ownedPets = data.ownedPets || ["gato_planta"];
        state.activePetId = data.activePetId || "gato_planta";
      }
      state.isLoaded = true;
    });
    builder.addCase(fetchInventoryData.rejected, (state) => {
      state.isLoaded = true;
    });
  }
});

export const { 
  resetInventory, addBadgeLocal, equipThemeLocal, unlockThemeLocal, 
  addItemLocal, useItemLocal, equipItemLocal, updateAvatarConfigLocal, unlockAvatarItemLocal, equipPetLocal, unlockPetLocal 
} = inventorySlice.actions;
export default inventorySlice.reducer;
