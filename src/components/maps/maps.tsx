import { useLocationStore } from "@/stores/user-store";
import { Driver } from "@/types";
import { DirectionsRenderer, GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import { useEffect, useState } from "react";

type MapProps = {
    defaultCenter: { lat: number; lng: number; },
    currentLocation: { lat: number; lng: number; },
}

export const Map = ({
    defaultCenter,
    currentLocation
}: MapProps) => {
    const mapStyles = { width: '100vw', height: '100vh' };
    const { pickup, destination, drivers } = useLocationStore();
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [zoom, setZoom] = useState(13);

    const [duration,setDuration] = useState<string | undefined>()

    useEffect(() => {
        // Reset zoom and directions when pickup or destination changes
        setZoom(13);
        setDirections(null);
        setDuration(undefined)
        if (pickup && destination) {
            const directionsService = new google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: pickup,
                    destination: destination,
                    travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                        const duration = result?.routes[0]?.legs[0]?.duration?.text;
                        setDuration(duration)
                        // Zoom out slightly to show the entire route

                        setZoom(12);
                    }
                }
            );
        }
    }, [pickup, destination]);

    return (
        <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={zoom}
            center={pickup || defaultCenter}
            key={`${pickup?.lat}-${pickup?.lng}-${destination?.lat}-${destination?.lng}`}
        >
            {pickup && <Marker position={pickup}
            icon={(pickup.lat == currentLocation.lat && pickup.lng == currentLocation.lng) ? (
                {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3,
                }
            ) : undefined} />}
            {destination && <Marker position={destination} />}
            {directions && duration && (
            <>
                <DirectionsRenderer
                directions={directions}
                options={{
                    suppressMarkers: true,
                    polylineOptions: {
                    strokeColor: '#4285F4',
                    strokeWeight: 4,
                    strokeOpacity: 0.8
                    }
                }}
                />
            </>
            )}
            {drivers.map((driver: Driver) => (
            <Marker
                key={driver.id}
                position={driver.location}
                icon={{
                url: driver.isAvailable ? '/available-driver.png' : '/busy-driver.png',
                }} />
            ))}
        </GoogleMap>
    )
}