import axios from "axios";
interface ReverseGeocodeResponse {
    city?: string;
    neighborhood?: string;
}

interface GeocodeResponse {
    latitude?: number;
    longitude?: number;
}
interface GeocodeCache {
    [key: string]: string;
}

const geocodeCache: GeocodeCache = {};

export async function reverseGeocode(lat: string, lon: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const latlonKey = `${lat},${lon}`;

    if (geocodeCache[latlonKey]) {
        return geocodeCache[latlonKey];
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlonKey}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            const formattedAddress = response.data.results[0].formatted_address;
            geocodeCache[latlonKey] = formattedAddress;
            return formattedAddress;
        } else {
            throw new Error(`Geocoding failed: ${response.data.status}`);
        }
    } catch (error) {
        console.error('Geocode error:', error);
        throw error;
    }
}


export async function geocodeAddress(address: string): Promise<{
    latitude: number;
    longitude: number;
}> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const urlAddress = encodeURIComponent(address);
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${urlAddress}&key=${apiKey}`);

        const result = response.data.results[0];

        if (!result) {
            throw new Error('Geocoding failed to retrieve valid coordinates.');
        }

        const { lat, lng } = result.geometry.location;

        if (!lat || !lng) {
            throw new Error('Geocoding failed to retrieve valid coordinates.');
        }

        return { latitude: lat, longitude: lng };
    } catch (error) {
        console.error('Error geocoding address:', error);
        throw error;
    }
}