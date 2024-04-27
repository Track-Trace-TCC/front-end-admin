'use client'

import { useAuth } from "@/app/context/auth-context";
import { useEffect, useState, useRef, MouseEvent } from "react";
import { Icon } from '@iconify/react';
import Sidebar from "./lateral-menu";
import { useRouter } from 'next/navigation';
type AuthContextType = {
    isAuthenticated: boolean;
    username: string;
    logout: () => void;
};

export function HeaderMenu() {
    const { isAuthenticated, username, logout } = useAuth() as AuthContextType;
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const handleLogout = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setIsDropdownOpen(false);
        logout();
        router.push('/auth')

    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside as any);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside as any);
        };
    }, []);


    return (
        isAuthenticated && (
            <>
                <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between w-full px-4 py-4 bg-white border-b">
                    <div className="flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800 hover:text-gray-600 mr-2">
                            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <h2 className="text-xl font-bold sm:block">
                            Track<span className="text-primary">&</span>Trace
                        </h2>
                    </div>
                    <div className="relative" ref={userMenuRef}>
                        <div className="flex items-center">
                            <span className="text-gray-800 hidden sm:flex sm:items-center sm:text-sm md:text-base lg:text-base xl:text-base mr-4">
                                Bom dia, {username}
                            </span>
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-gray-800 hover:text-gray-600">
                                <Icon icon="material-symbols-light:logout" className="w-6 h-6" />
                            </button>
                        </div>
                        {isDropdownOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={handleLogout}
                                >
                                    Sair
                                </a>
                            </div>
                        )}
                    </div>
                </div>
                <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            </>
        )
    );
}
