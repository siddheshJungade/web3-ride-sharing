import {create} from 'zustand';

interface Ride {
  id: string;
  driverId: string;
  customerId: string;
  status: 'available' | 'booked' | 'completed';
  price: number;
}

interface RideStore {
  rides: Ride[];
  addRide: (ride: Ride) => void;
  updateRide: (id: string, updatedRide: Partial<Ride>) => void;
  removeRide: (id: string) => void;
}

export const useRideStore = create<RideStore>((set) => ({
  rides: [],
  addRide: (ride) => set((state) => ({ rides: [...state.rides, ride] })),
  updateRide: (id, updatedRide) =>
    set((state) => ({
      rides: state.rides.map((ride) => (ride.id === id ? { ...ride, ...updatedRide } : ride)),
    })),
  removeRide: (id) => set((state) => ({ rides: state.rides.filter((ride) => ride.id !== id) })),
}));



