'use client'

import { useEffect, useState } from "react";
import axios from "../lib/axios";
import AuthForm from "./_components/auth-form";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
export default function Page() {
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter()
    const { login } = useAuth();
    const onSubmit = async (formData: { username: string; password: string; remember: boolean }) => {
        setIsLoading(true)
        if (!formData.username || !formData.password) {
            setIsError(true)
            return;
        }
        try {
            const result = await axios.post('/auth/admin', {
                email: formData.username,
                password: formData.password
            })
            if (result.status === 201) {
                setIsError(false)
                const { access_token, name } = result.data
                login(access_token, formData.remember, name);
                router.push('/')
            }
            setIsLoading(false)
        } catch (error) {
            console.error(error);
            setIsError(true)
            setIsLoading(false)
        }

    }

    useEffect(() => {
        if (localStorage.getItem('token') || sessionStorage.getItem('token')) {
            router.push('/')
        }
    }, [router])
    return (
        <AuthForm onSubmit={onSubmit} IsLoading={isLoading} IsError={isError} />
    );
}