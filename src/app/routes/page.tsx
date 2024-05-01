'use client'

'use client'

import { useState, useEffect, useRef } from "react";
import { useMap } from "@/app/hooks/useMap";
import { socket } from "@/app/utils/socket-io";
import { Icon } from '@iconify/react/dist/iconify.js';
import PrivateRoute from "../utils/private-route";

export function AdminPage() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const map = useMap(mapContainerRef);
    const [activeRoutes, setActiveRoutes] = useState<any[]>([]);

    useEffect(() => {
        socket.connect();

        socket.on("admin-new-points", async (data: {
            motorista: any; route_id: string, driver_id: string, lat: number, lng: number
        }) => {
            if (data?.route_id && map && !map?.hasRoute(data.route_id)) {
                const response = await fetch(`http://localhost:3000/routes/${data.route_id}`);
                const route: any = await response.json();

                const legs = route.directions.routes[0].legs.map((leg: { start_location: any; end_location: any; }) => ({
                    startLocation: leg.start_location,
                    endLocation: leg.end_location
                }));

                map?.removeRoute(data.route_id);
                const currentColor = await map?.addRouteWithIcons({
                    routeId: data?.route_id,
                    legs: legs,
                    carMarkerOptions: {
                        position: legs[0].startLocation,
                    },
                    directionsService: new google.maps.DirectionsService(),
                });
                setActiveRoutes(prevRoutes => [...prevRoutes, {
                    route_id: data.route_id,
                    color: currentColor,
                    driver_id: route?.motorista.id_Motorista,
                    driver_name: route.motorista?.nome
                }]);
            }

            data?.route_id && map?.moveCar(data.route_id, { lat: data.lat, lng: data.lng });
        });

        return () => {
            socket.disconnect();
        }
    }, [map]);

    return (
        <div className="flex flex-col lg:flex-row">
            <div className="lg:w-3/4 px-4 mt-24" style={{ height: '75vh' }}>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">Administração do Mapa</h1>
                <div id="map" ref={mapContainerRef} className="h-full w-full rounded-lg shadow-md" style={{ padding: '20px', backgroundColor: '#fff' }}></div>
            </div>
            <div className="lg:w-1/4 p-4 mt-10 lg:mt-24 ">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">Motoristas</h1>
                {activeRoutes.length > 0 ? (
                    activeRoutes.map(route => (
                        <div key={route.route_id} className="mb-2 flex items-center">
                            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: route.color }}></div>
                            <Icon icon="material-symbols:person-outline" />
                            <div>
                                <div className="text-sm font-bold">{route.driver_name}</div>
                                <div className="text-xs">ID: {route.driver_id}</div>
                                <div className="text-xs">Rota: {route.route_id}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Nenhuma rota ativa.</p>
                )}
            </div>
        </div>
    );
}

export default PrivateRoute(AdminPage);


