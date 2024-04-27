'use client'

import { Button } from "@/components/ui/button";
import PrivateRoute from "../utils/private-route";
import { Icon } from '@iconify/react/dist/iconify.js';
import DataTable from "@/components/ui/datatable";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { Label } from "@radix-ui/react-label";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

const columns = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Nome', accessor: 'name' },
    { Header: 'Email', accessor: 'email' },
];

interface User {
    id: string
    name: string
    email: string
    password?: string
}
function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [search, setSearch] = useState<string>('')
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [id, setId] = useState<string>('')
    const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleEdit = (userId: string) => {
        setId(userId)
        const user: User | undefined = users.find((user: User) => user.id === userId)
        if (!user) {
            return
        }
        setEmail(user.email || '')
        setName(user.name || '')
        setOpenModal(true)
    };

    const handleCreate = () => {
        setId('')
        setEmail('')
        setPassword('')
        setName('')
        setOpenModal(true)
    }

    const handleDelete = (userId: string) => {
        setId(userId)
        setOpenModalDelete(true)
    };

    useEffect(() => {
        axios.get(`/admin-users?search=${search}`).then(response => {
            setUsers(response.data as User[])
        })
    }, [axios, search])

    const handleSubmit = async () => {
        if (!email || !name) {
            toast.error('Preencha todos os campos')
            return
        }

        setIsLoading(true)
        try {
            let action = id ? 'editado' : 'criado';
            let response: any;
            if (id) {
                response = await axios.patch(`/admin-users/${id}`, { email, name });
                setUsers(users.map(user => user.id === id ? {
                    ...user,
                    email: response.data.email,
                    name: response.data.nome
                } : user));
            } else {
                response = await axios.post(`/admin-users`, { email, name, password });
                setUsers([...users, {
                    id: response.data.id_Admin,
                    email,
                    name: response.data.nome
                }]);

            }
            setIsLoading(false)
            toast.success(`Usuário ${action} com sucesso!`);
            setOpenModal(false);
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(error);
            const errorMessage = (axiosError.response?.data as { error?: string })?.error || 'Erro desconhecido, se persistir contacte o suporte';
            toast.error(<div>
                {`Erro ao ${id ? 'atualizar' : 'criar'} usuário`}
                <br />
                <b>{errorMessage}</b>
            </div>);
            setIsLoading(false)
        }
    }

    const handleSubmitDelete = async () => {
        try {
            setIsLoading(true)
            await axios.delete(`/admin-users/${id}`);
            setUsers(users.filter(user => user.id !== id));
            toast.success('Usuário deletado com sucesso!');
            setOpenModalDelete(false);
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            console.error(error);
            toast.error('Erro ao deletar usuário');
        }
    }
    return (
        <main className="flex mt-16  w-full flex-col bg-gray-100 p-4 lg:p-10">
            <div className="w-full max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Usuários Administradores</h1>
                    <div className="flex gap-2 items-center">
                        <Input
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder="Nome ou Email"
                            className="w-full rounded-md border-gray-300 p-2 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <Button
                            onClick={() => handleCreate()}
                            className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Icon icon="ci:add" className="h-5 w-5 mr-2" /> Criar novo usuário
                        </Button>
                    </div>
                </div>
                <DataTable columns={columns} data={users} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
            <Modal isLoading={isLoading} title={id ? "Editar Usuário" : "Criar Novo Usuário"} isOpen={openModal} onCancel={() => setOpenModal(false)} onConfirm={() => handleSubmit()}>
                <Label>
                    Nome
                </Label>
                <Input
                    type="text"
                    placeholder="José Francisco Domingues"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className="w-full rounded-md border-gray-300 p-2 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <div className="mt-3">
                    <Label >
                        Email
                    </Label>
                    <Input
                        type="email"
                        placeholder="josefrancisco@track.com"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        className="w-full rounded-md border-gray-300 p-2 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                {!id && <div className="mt-3">
                    <Label >
                        Senha
                    </Label>
                    <Input
                        type="password"
                        placeholder="********"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        className="w-full rounded-md border-gray-300 p-2 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>}
            </Modal>
            <Modal isLoading={isLoading} title="Deletar Usuário?" isOpen={openModalDelete} onCancel={() => setOpenModalDelete(false)} onConfirm={() => handleSubmitDelete()}>
                <span className="text-sm">
                    Tem certeza que deseja deletar o usuário?
                </span>
            </Modal>
        </main>
    );
}

export default PrivateRoute(AdminUsersPage);
