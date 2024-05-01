import { getCurrentPosition } from "../utils/geolocation";
import { Loader } from "@googlemaps/js-api-loader";
import React, { useState } from "react";
import { Map } from "../lib/map";
import { Console } from "console";

export function useMap(containerRef: React.RefObject<HTMLDivElement>) {
    const [map, setMap] = useState<Map>();
    React.useEffect(() => {

        (async () => {
            const loader = new Loader({
                libraries: ['routes', 'geometry'],
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
            });

            const [, , position] = await Promise.all([
                loader.importLibrary('routes'),
                loader.importLibrary('geometry'),
                await getCurrentPosition({ enableHighAccuracy: true })
            ]);

            const map = new Map(containerRef.current!, {
                zoom: 15,
                center: position,
            });

            setMap(map);
        })();
    }, [containerRef])

    return map;
}