import axios from "axios";
interface ReverseGeocodeResponse {
    city?: string;
    neighborhood?: string;
}
export async function reverseGeocode(latitude: number, longitude: number): Promise<ReverseGeocodeResponse> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GEOCODE_API_KEY;
        const response = await axios.get(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=${apiKey}`);
        const { address } = response.data;

        const city = address.city || 'Cidade desconhecida';
        const neighborhood = address.postcode || 'CEP desconhecido';

        return { city, neighborhood };
    } catch (error) {
        console.error('Erro na geocodificação reversa:', error);
        return { city: 'Cidade desconhecida', neighborhood: 'Bairro desconhecido' };
    }
}