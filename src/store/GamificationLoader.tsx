"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppDispatch, useAppSelector } from './index';
import { fetchPlayerData } from './slices/playerSlice';
import { fetchInventoryData } from './slices/inventorySlice';
import { fetchTasks } from './slices/tasksSlice';

export default function GamificationLoader() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { equippedTheme } = useAppSelector(state => state.inventory);

  useEffect(() => {
    if (user) {
      dispatch(fetchPlayerData(user.uid));
      dispatch(fetchInventoryData(user.uid));
      dispatch(fetchTasks(user.uid));
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', equippedTheme || 'default');
    }
  }, [equippedTheme]);

  return null;
}
