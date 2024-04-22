import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { SVGProps, useState } from "react"

interface AuthFormProps {
    onSubmit: (formData: { username: string; password: string; remember: boolean }) => void;
    IsError?: boolean;
    IsLoading?: boolean;
}

export default function AuthForm({ onSubmit, IsError, IsLoading }: AuthFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit({ username, password, remember });
    };

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleRememberChange = (checked: boolean) => {
        setRemember(checked);
    };


    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FFF]">
            <div className="w-full max-w-md">
                <div className="text-left mb-8">
                    <h1 className="text-4xl font-bold">
                        Track<span className="text-primary">&</span>Trace
                    </h1>
                    <div className="flex items-center">
                        <div className="border-l-4 border-primary pr-2" style={{ height: '1.5em' }}></div>
                        <p className="text-md font-bold">Painel do administrador</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={`rounded-lg bg-card p-8 shadow-lg`}>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="username">Login</Label>
                                <Input id="username" value={username} onChange={handleUsernameChange} className={`bg-[#FFF] ${IsError ? 'border-red-500' : ''}`} placeholder="E-mail ou nome de usuário" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Senha</Label>
                                <Input id="password" value={password} onChange={handlePasswordChange} className={`bg-[#FFF] ${IsError ? 'border-red-500' : ''}`} type="password" placeholder="Digite sua senha" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox checked={remember} onCheckedChange={handleRememberChange} id="remember" />
                                <label htmlFor="remember" className="text-sm">
                                    Lembrar de mim
                                </label>
                            </div>
                            {IsError && (
                                <p className="text-red-500 text-sm">Email ou senha incorretos</p>
                            )}
                            <Button isLoading={IsLoading} className={`w-full text-white hover:bg-blue-700`}>
                                Entrar
                                <ArrowRightIcon className="ml-2" />
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

const ArrowRightIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
