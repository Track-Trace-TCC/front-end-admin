'use client'

import { useAuth } from "@/app/context/auth-context";
import { useEffect, useState } from "react";
import Sidebar from "./lateral-menu";



export function HeaderMenu() {
    const { isAuthenticated, username } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        isAuthenticated &&
        <>
            <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between w-full p-4 bg-white border-b">
                <div className="flex items-center">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    <h2 className="text-3xl ml-3 font-bold">
                        Track<span className="text-primary">&</span>Trace
                    </h2>
                </div>
                <div className="flex items-center">
                    <span className="text-gray-800 mr-4">Bom dia, {username}!</span>
                    <button className="text-gray-800 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
}

