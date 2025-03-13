import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {LAMPORTS_PER_SOL} from "@solana/web3.js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



// You can use a geocoding service like Google Maps
// to convert latitude and longitude to an address.
export const getAddressFromLatLon = async (lat: number, lon: number) => {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`);
  const data = await response.json();
  if (data.status === "OK" && data.results.length > 0) {
    return data.results[0].formatted_address;
  } else {
    return "Invalid address";
  }
  return `Mock Address for (${lat}, ${lon})`;
};



export function lamportsToSol(lamports: number): number {
  const sol = lamports / LAMPORTS_PER_SOL;
  if (sol < 1e-6) {
    return Number(sol.toExponential(2));
  } else {
    return Number(sol.toFixed(2));
  }
}

export const calculateFare = (distance: number) => {
  const baseFare = 5; // Base fare in currency units
  const farePerKm = 2; // Fare per kilometer in currency units
  const fareInCurrency = baseFare + distance * farePerKm;
  const fareInLamports = fareInCurrency * LAMPORTS_PER_SOL;
  return (fareInLamports/100);
};


export const calculateDistance = (pickup: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(destination.lat - pickup.lat);
  const dLng = toRad(destination.lng - pickup.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pickup.lat)) * Math.cos(toRad(destination.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
};
