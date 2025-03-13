import { User } from '@/types';
import {create} from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: (userData: User) => set({ user: userData, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));