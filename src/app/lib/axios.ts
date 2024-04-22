import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useRouter } from 'next/router';


const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config: any) => {
    config.headers = config.headers || {};

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.status === 401) {
            localStorage.removeItem('token');
            const router = useRouter();
            router.push('/auth');;
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;