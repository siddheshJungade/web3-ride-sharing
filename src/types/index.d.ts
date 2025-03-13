import { PublicKey } from '@solana/web3.js';

declare interface User {
    id: string;
    publicKey: PublicKey;
    username: string;
    email?: string;
    walletBalance: number;
    isConnected: boolean;
    createdAt: Date;
    lastLogin?: Date;
}



declare type Driver = {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  isAvailable: boolean;
};

declare interface LocationStore {
  pickup: { lat: number; lng: number, name?: string } | null;
  destination: { lat: number; lng: number, name?: string} | null;
  drivers: Array<Driver>;
  distance: number | null
  duration: number | null
  fare: number | null,
  setFare: (fare: number | null) => void;
  setDistance: (distance: number | null) => void;
  setDuration: (duration: number | null) => void;
  setPickup: (location: { lat: number; lng: number } | null) => void;
  setDestination: (location: { lat: number; lng: number } | null) => void;
  updateDrivers: (drivers: any[]) => void;
}

export enum UserType {
  CUSTOMER = 'CUSTOMER',
  DRIVER = 'DRIVER'
}
declare interface UserStore {
  user: User | null;
  type: UserType | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  setType: (type: UserType) => void;
  allowSwitch: boolean,
  setDisableSwitch: (value: boolean) => void
}