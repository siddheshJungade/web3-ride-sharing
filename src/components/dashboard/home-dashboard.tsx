"use client";

import { useEffect, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { useLocationStore, useUserStore } from "@/stores/user-store";
import { Map } from "../maps/maps";
import { ToastContainer, toast } from 'react-toastify';
import Autocomplete from "react-google-autocomplete";
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/model"

import { calculateDistance, calculateFare, getAddressFromLatLon } from "@/lib/utils"

function HomeDashboard() {
  const { type } = useUserStore()
  const { isLoaded: isMapScriptLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
    libraries: ["places"],
  });


  const { setPickup, setDestination, pickup, destination, setDistance, setFare, distance, fare } = useLocationStore();
  const defaultCenter = { lat: 0, lng: 0 };
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  }>(defaultCenter);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const addressLine = await getAddressFromLatLon( position.coords.latitude, position.coords.longitude) 
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: addressLine
          };
          setCurrentLocation(userLocation);
          if(!pickup){
            setPickup(userLocation);
          }
        },
        (error) => {
          toast.error(`Error getting location: ${error.message}`);
          console.error("Error getting location:", error);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    if (isMapScriptLoaded) {
      getCurrentLocation();
    }
  }, [getCurrentLocation, isMapScriptLoaded]);

  if (!isMapScriptLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading Google Maps...</div>;
  }

  if (loadError) {
    return <div className="text-red-500">Error loading Google Maps</div>;
  }

  return (
    <div className="w-full h-screen flex justify-start items-start relative">
      <ToastContainer position="top-right" />
      <Map defaultCenter={defaultCenter} currentLocation={currentLocation} />
      <div className="flex bg-white p-4 rounded-xl flex-col gap-2 m-16 justify-start z-100 absolute">
        <div className="flex flex-col gap-4 justify-start">
          {[
            { title: "Pickup", method: setPickup, value: pickup },
            { title: "Destination", method: setDestination,value: destination },
          ].map((item, index) => (<>
          
            <div key={index} className="flex">
            <p className="mx-2"> Current </p>
              <Autocomplete
                defaultValue={item.value?.name}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}
                onPlaceSelected={(place) => {
                  if (place?.geometry?.location) {
                    const location = {
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                      name: place.formatted_address
                    };
                    item.method(location);
                  }
                }}
                placeholder={`Enter ${item.title} Location`}
                className="w-[400px] bg-white px-3 py-2 border rounded-md"
                />

            </div>
            </>
          ))}
        </div>
         <Modal />
      </div>
    </div>
  );
}

export default HomeDashboard;