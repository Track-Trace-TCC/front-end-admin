'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthContextType = {
    isAuthenticated: boolean;
    username?: string
    login: (token: string, remember: boolean, username: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [username, setUsername] = useState<string>();

    const login = (token: string, remember: boolean, username: string) => {
        if (remember) {
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
        } else {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('username', username);
        }
        setUsername(username)
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('username');
        setIsAuthenticated(false);
        setUsername("");
    };


    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const savedUsername = localStorage.getItem('username') || sessionStorage.getItem('username');
        if (token && savedUsername) {
            setIsAuthenticated(true);
            setUsername(savedUsername);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
