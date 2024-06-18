'use client'

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';



const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config: any) => {
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

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
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401 && window.location.pathname !== '/auth') {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = '/auth';
        }
        return Promise.reject(error);
    }
);


export default api;