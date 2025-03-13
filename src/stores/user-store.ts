import { LocationStore, User, UserStore, UserType } from '@/types';
import {create} from 'zustand';


export const useUserStore = create<UserStore>((set) => ({
  user: null,
  type: null,
  allowSwitch: true,
  setUser: (user: User) => set({ user }),
  clearUser: () => set({ user: null }),
  setType: (type: UserType) => set({type}),
  setDisableSwitch: (value: boolean) => set({allowSwitch:value}) 
}));



export const useLocationStore = create<LocationStore>((set) => ({
  pickup: null,
  destination: null,
  duration: null,
  distance: null,
  drivers: [],
  fare: null,
  setFare: (fare) => set({fare: fare}),
  setDuration: (duration) => set({ duration: duration }),
  setDistance: (distance) => set({ distance: distance }),
  setPickup: (location) => set({ pickup: location }),
  setDestination: (location) => set({ destination: location }),
  updateDrivers: (drivers) => set({ drivers }),
}));