'use client'

import { useAuth } from "@/app/context/auth-context";
import { useEffect, useState } from "react";

export function Footer() {
    const { isAuthenticated } = useAuth();

    return (
        isAuthenticated &&
        <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-between w-full p-4 bg-white border-t">
            <span className="text-sm text-gray-600">&copy; 2024 <b>Track<span className="text-primary">&</span>Trace</b>. Todos os direitos reservados.</span>
            <span className="text-sm text-gray-600">Sistema licenciado para empresa <b>Track&Trace LTDA</b>. </span>
        </div>
    );
}