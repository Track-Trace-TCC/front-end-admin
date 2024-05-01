import { sample, shuffle } from "lodash";
import type { DirectionsResponseData } from "@googlemaps/google-maps-services-js";
interface RouteForClientOptions {
    routeId: string;
    legs: Array<{
        startLocation: google.maps.LatLngLiteral;
        endLocation: google.maps.LatLngLiteral;
    }>;
    carMarkerOptions: google.maps.MarkerOptions;
    directionsService: google.maps.DirectionsService;
    clientLegIndex: number;
}
export class Map {
    public map: google.maps.Map;
    private routes: { [routeId: string]: Route } = {};
    private colorsInUse: Set<string> = new Set();
    constructor(element: HTMLElement, options: google.maps.MapOptions) {
        this.map = new google.maps.Map(element, {
            ...options,
        });
    }

    async addRouteWithLegs(routeOptions: {
        routeId: string;
        legs: Array<{
            startLocation: google.maps.LatLngLiteral,
            endLocation: google.maps.LatLngLiteral
        }>;
        carMarkerOptions: google.maps.MarkerOptions;
        directionsService: google.maps.DirectionsService;
    }) {
        if (routeOptions.routeId in this.routes) {
            throw new RouteExistsError(`Route with ID ${routeOptions.routeId} already exists.`);
        }

        const { routeId, legs, carMarkerOptions, directionsService } = routeOptions;

        const overallStart = legs[0].startLocation;
        const overallEnd = legs[legs.length - 1].endLocation;

        const color = this.selectAvailableColor(); // Seleciona uma cor não usada
        if (!color) {
            throw new Error("No available colors left for routes.");
        }
        const route = new Route({
            startMarkerOptions: { position: overallStart, map: this.map },
            endMarkerOptions: { position: overallEnd, map: this.map },
            carMarkerOptions: { ...carMarkerOptions, map: this.map, icon: makeCarIcon(color || '#FF0000') },
            legs,
            color: color,
            map: this.map,
        });

        const waypoints = legs.slice(1, -1).map(leg => ({
            location: new google.maps.LatLng(leg.startLocation.lat, leg.startLocation.lng),
            stopover: true,
        }));

        const request: google.maps.DirectionsRequest = {
            origin: new google.maps.LatLng(overallStart.lat, overallStart.lng),
            destination: new google.maps.LatLng(overallEnd.lat, overallEnd.lng),
            waypoints,
            travelMode: google.maps.TravelMode.DRIVING,
        };

        await route.calculateRoute(directionsService, request, {
            strokeColor: color,
            strokeOpacity: 0.6,
            strokeWeight: 6
        });

        this.routes[routeId] = route;

        this.fitBounds();
        console.log('color: ', color)
        return color;
    }
    // async addRouteForClient({
    //     routeId,
    //     legs,
    //     carMarkerOptions,
    //     directionsService,
    //     clientLegIndexStart,
    //     clientLegIndexEnd
    // }: {
    //     routeId: string,
    //     legs: Array<{
    //         startLocation: google.maps.LatLngLiteral,
    //         endLocation: google.maps.LatLngLiteral
    //     }>,
    //     carMarkerOptions: google.maps.MarkerOptions,
    //     directionsService: google.maps.DirectionsService,
    //     clientLegIndexStart: number,
    //     clientLegIndexEnd: number
    // }) {
    //     if (this.routes[routeId]) {
    //         throw new RouteExistsError(`Route with ID ${routeId} already exists.`);
    //     }

    //     // Cria uma nova lista de legs contendo apenas até o cliente específico,
    //     // mais a leg final após o cliente para manter o destino final da rota.
    //     const filteredLegs = legs.slice(0, clientLegIndexEnd + 1);
    //     console.log(filteredLegs)
    //     // Preparação dos waypoints para a rota modificada, excluindo o último destino.
    //     const waypoints = filteredLegs.slice(1, -1).map(leg => ({
    //         location: new google.maps.LatLng(leg.startLocation.lat, leg.startLocation.lng),
    //         stopover: true,
    //     }));

    //     const request: google.maps.DirectionsRequest = {
    //         origin: new google.maps.LatLng(filteredLegs[0].startLocation.lat, filteredLegs[0].startLocation.lng),
    //         destination: new google.maps.LatLng(filteredLegs[filteredLegs.length - 1].endLocation.lat, filteredLegs[filteredLegs.length - 1].endLocation.lng),
    //         waypoints,
    //         travelMode: google.maps.TravelMode.DRIVING,
    //     };

    //     const route = new Route({
    //         startMarkerOptions: { position: filteredLegs[0].startLocation, map: this.map, visible: true },
    //         endMarkerOptions: { position: filteredLegs[filteredLegs.length - 1].endLocation, map: this.map, visible: true },
    //         carMarkerOptions: { ...carMarkerOptions, map: this.map },
    //         legs: filteredLegs,
    //         map: this.map,
    //     });

    //     await route.calculateRoute(directionsService, request);

    //     this.routes[routeId] = route;
    //     this.fitBounds();
    // }
    async addRouteWithIcons(routeOptions: {
        routeId: string;
        legs: Array<{
            startLocation: google.maps.LatLngLiteral,
            endLocation: google.maps.LatLngLiteral
        }>;
        carMarkerOptions: Omit<google.maps.MarkerOptions, "icon">;
        directionsService: google.maps.DirectionsService;
    }) {
        const color = sample(shuffle(colors)) as string;
        const modifiedLegs = routeOptions.legs.map(leg => ({
            ...leg,
        }));

        const modifiedCarMarkerOptions = {
            ...routeOptions.carMarkerOptions,
            icon: makeCarIcon(color),
        };

        return await this.addRouteWithLegs({
            routeId: routeOptions.routeId,
            legs: modifiedLegs,
            carMarkerOptions: modifiedCarMarkerOptions,
            directionsService: routeOptions.directionsService,
        });

    }
    private fitBounds() {
        const bounds = new google.maps.LatLngBounds();

        Object.keys(this.routes).forEach((id: string) => {
            const route = this.routes[id];
            bounds.extend(route.startMarker.getPosition()!);
            bounds.extend(route.endMarker.getPosition()!);
        });

        this.map.fitBounds(bounds);
    }

    moveCar(routeId: string, position: google.maps.LatLngLiteral) {
        this.routes[routeId].carMarker.setPosition(position);
    }
    selectAvailableColor() {
        const availableColors = colors.filter(c => !this.colorsInUse.has(c));
        if (availableColors.length > 0) {
            return sample(shuffle(availableColors)); // Seleciona uma cor aleatoriamente das disponíveis
        }
        return null;
    }
    removeRoute(id: string) {
        if (!this.hasRoute(id)) {
            return;
        }
        const route = this.routes[id];
        route.delete();
        delete this.routes[id];
    }

    removeAllRoutes() {
        Object.keys(this.routes).forEach((id) => this.removeRoute(id));
    }

    hasRoute(id: string) {
        return id in this.routes;
    }

    getRoute(id: string) {
        return this.routes[id];
    }
}

export class RouteExistsError extends Error { }

export class Route {
    public startMarker: google.maps.Marker;
    public endMarker: google.maps.Marker;
    public carMarker: google.maps.Marker;
    public legMarkers: google.maps.Marker[] = [];
    public directionsRenderer: google.maps.DirectionsRenderer;
    map: google.maps.Map;
    constructor(options: {
        startMarkerOptions: google.maps.MarkerOptions;
        endMarkerOptions: google.maps.MarkerOptions;
        carMarkerOptions: google.maps.MarkerOptions;
        legs: Array<{
            startLocation: google.maps.LatLngLiteral,
            endLocation: google.maps.LatLngLiteral
        }>;
        color?: string;
        map: google.maps.Map;
        visibleLegs?: number[]
    }) {
        const { startMarkerOptions, endMarkerOptions, carMarkerOptions, legs, map, visibleLegs } = options;
        this.map = options.map;
        this.startMarker = new google.maps.Marker({ ...startMarkerOptions, map });
        this.endMarker = new google.maps.Marker({ ...endMarkerOptions, map });
        this.carMarker = new google.maps.Marker({ ...carMarkerOptions, map });



        legs.forEach((leg, index) => {
            const marker = new google.maps.Marker({
                position: leg.startLocation,
                map: map,
                label: {
                    text: String(index + 1),
                    fontSize: '24px',
                    fontWeight: 'bold',
                },
            });
            this.legMarkers.push(marker);
        });


        this.directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
                strokeColor: '#FF0000',
                strokeOpacity: 0.6,
                strokeWeight: 6,
            },
        });
    }

    async calculateRoute(directionsService: google.maps.DirectionsService, request: google.maps.DirectionsRequest, polylineOptions: google.maps.PolylineOptions) {
        const result = await directionsService.route(request);
        this.directionsRenderer = new google.maps.DirectionsRenderer({
            map: this.map,
            suppressMarkers: true,
            polylineOptions: polylineOptions || {
                strokeColor: '#FF0000', // cor padrão se não especificada
                strokeOpacity: 0.6,
                strokeWeight: 6,
            }
        });
        this.directionsRenderer.setDirections(result);
    }

    delete() {
        this.startMarker.setMap(null);
        this.endMarker.setMap(null);
        this.carMarker.setMap(null);
        this.directionsRenderer.setMap(null);
    }
}

export const makeCarIcon = (color: string) => ({
    path: "M23.5 7c.276 0 .5.224.5.5v.511c0 .793-.926.989-1.616.989l-1.086-2h2.202zm-1.441 3.506c.639 1.186.946 2.252.946 3.666 0 1.37-.397 2.533-1.005 3.981v1.847c0 .552-.448 1-1 1h-1.5c-.552 0-1-.448-1-1v-1h-13v1c0 .552-.448 1-1 1h-1.5c-.552 0-1-.448-1-1v-1.847c-.608-1.448-1.005-2.611-1.005-3.981 0-1.414.307-2.48.946-3.666.829-1.537 1.851-3.453 2.93-5.252.828-1.382 1.262-1.707 2.278-1.889 1.532-.275 2.918-.365 4.851-.365s3.319.09 4.851.365c1.016.182 1.45.507 2.278 1.889 1.079 1.799 2.101 3.715 2.93 5.252zm-16.059 2.994c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm10 1c0-.276-.224-.5-.5-.5h-7c-.276 0-.5.224-.5.5s.224.5.5.5h7c.276 0 .5-.224.5-.5zm2.941-5.527s-.74-1.826-1.631-3.142c-.202-.298-.515-.502-.869-.566-1.511-.272-2.835-.359-4.441-.359s-2.93.087-4.441.359c-.354.063-.667.267-.869.566-.891 1.315-1.631 3.142-1.631 3.142 1.64.313 4.309.497 6.941.497s5.301-.184 6.941-.497zm2.059 4.527c0-.828-.672-1.5-1.5-1.5s-1.5.672-1.5 1.5.672 1.5 1.5 1.5 1.5-.672 1.5-1.5zm-18.298-6.5h-2.202c-.276 0-.5.224-.5.5v.511c0 .793.926.989 1.616.989l1.086-2z",
    fillColor: color,
    strokeColor: color,
    strokeWeight: 1,
    fillOpacity: 1,
    anchor: new google.maps.Point(0, 0),
});

export const makeMarkerIcon = (color: string, label: string = '') => {
    // Supondo que o tamanho do ícone seja 70x46 como antes
    return {
        // path: "M66.9,41.8c0-11.3-9.1-20.4-20.4-20.4c-11.3,0-20.4,9.1-20.4,20.4c0,11.3,20.4,32.4,20.4,32.4S66.9,53.1,66.9,41.8z    M37,41.4c0-5.2,4.3-9.5,9.5-9.5c5.2,0,9.5,4.2,9.5,9.5c0,5.2-4.2,9.5-9.5,9.5C41.3,50.9,37,46.6,37,41.4z",
        fillColor: color,
        fillOpacity: 1,
        strokeColor: color,
        strokeWeight: 1,
        label: {
            text: String(label),
            color: color, // Cor branca para contraste
            fontSize: '24px', // Tamanho maior para legibilidade
            fontWeight: 'bold', // Negrito para destacar
        },
        labelOrigin: new google.maps.Point(1, 10),
    };
};

const colors = [
    "#004D40", // Verde Escuro (Teal)
    "#D50000", // Vermelho Vivo
    "#2962FF", // Azul Forte
    "#C51162", // Magenta Escuro
    "#FF6D00", // Laranja Escuro
    "#6200EA", // Roxo
    "#0091EA", // Azul Claro Forte
    "#00BFA5", // Verde-Água Escuro
    "#FFD600", // Amarelo Vivo
    "#00C853", // Verde Vivo
    "#AA00FF", // Ametista Forte
    "#DD2C00", // Laranja Queimado
    "#3E2723", // Marrom Escuro
    "#212121", // Cinza Muito Escuro
    "#263238", // Azul Carvão
    "#1B5E20", // Verde Floresta
    "#BF360C"  // Terracota
];


function convertDirectionsResponseToDirectionsResult(
    directionsResponse: DirectionsResponseData & { request: any }
): google.maps.DirectionsResult {
    const copy = { ...directionsResponse };

    return {
        available_travel_modes:
            copy.available_travel_modes as google.maps.TravelMode[],
        geocoded_waypoints: copy.geocoded_waypoints,
        status: copy.status,
        request: copy.request,
        //@ts-expect-error
        routes: copy.routes.map((route) => {
            const bounds = new google.maps.LatLngBounds(
                route.bounds.southwest,
                route.bounds.northeast
            );
            return {
                bounds,
                overview_path: google.maps.geometry.encoding.decodePath(
                    route.overview_polyline.points
                ),
                overview_polyline: route.overview_polyline,
                warnings: route.warnings,
                copyrights: route.copyrights,
                summary: route.summary,
                waypoint_order: route.waypoint_order,
                fare: route.fare,
                legs: route.legs.map((leg) => ({
                    ...leg,
                    start_location: new google.maps.LatLng(
                        leg.start_location.lat,
                        leg.start_location.lng
                    ),
                    end_location: new google.maps.LatLng(
                        leg.end_location.lat,
                        leg.end_location.lng
                    ),
                    steps: leg.steps.map((step) => ({
                        path: google.maps.geometry.encoding.decodePath(
                            step.polyline.points
                        ),
                        start_location: new google.maps.LatLng(
                            step.start_location.lat,
                            step.start_location.lng
                        ),
                    })),
                })),
            };
        }),
    };
}