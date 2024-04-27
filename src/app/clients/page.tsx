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
    { Header: 'Nome', accessor: 'nome' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'CPF', accessor: 'cpf' },
    { Header: 'Telefone', accessor: 'telefone' },
];

interface Client {
    id: string
    nome: string
    email: string
    cpf: string
    telefone: string
}
function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [search, setSearch] = useState<string>('')
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')
    const [cpf, setCPF] = useState<string>('')
    const [telefone, setTelefone] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [id, setId] = useState<string>('')
    const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleEdit = (clientId: string) => {
        setId(clientId)
        const client: Client | undefined = clients.find((client: Client) => client.id === clientId)
        if (!client) {
            return
        }
        setEmail(client.email || '')
        setName(client.nome || '')
        setTelefone(client.telefone || '')
        setCPF(client.cpf || '')
        setOpenModal(true)
    };

    const handleCreate = () => {
        setId('')
        setEmail('')
        setTelefone('')
        setName('')
        setCPF('')
        setOpenModal(true)
    }

    const handleDelete = (userId: string) => {
        setId(userId)
        setOpenModalDelete(true)
    };

    useEffect(() => {
        axios.get(`/customers?search=${search}`).then(response => {
            setClients(response.data as Client[])
        })
    }, [axios, search])

    const handleSubmit = async () => {
        if (!email || !name || !cpf || !telefone) {
            toast.error('Preencha todos os campos')
            return
        }

        setIsLoading(true)
        try {
            let action = id ? 'editado' : 'criado';
            let response: any;
            if (id) {
                response = await axios.patch(`/customers/${id}`, { email, nome: name, telefone, cpf });
                setClients(clients.map(user => user.id === id ? {
                    ...user,
                    email: response.data.email,
                    nome: response.data.nome,
                    telefone: response.data.telefone,
                    cpf: response.data.cpf
                } : user));
            } else {
                response = await axios.post(`/customers`, { email, nome: name, telefone, cpf });
                setClients([...clients, {
                    id: response.data.id_Cliente,
                    email,
                    cpf: response.data.cpf,
                    telefone: response.data.telefone,
                    nome: response.data.nome
                }]);

            }
            setIsLoading(false)
            toast.success(`Cliente ${action} com sucesso!`);
            setOpenModal(false);
        } catch (error) {
            const axiosError = error as AxiosError;
            interface AxiosErrorResponse {
                message?: string[];
            }
            console.error(error);
            let errorMessage = (axiosError.response?.data as { error?: string })?.error || 'Erro desconhecido, se persistir contacte o suporte';
            if ((error as AxiosError)?.response?.status === 400) {
                const axiosErrorData = axiosError.response?.data as AxiosErrorResponse | undefined;
                errorMessage = axiosErrorData?.message?.[0] ?? 'Erro desconhecido, se persistir contacte o suporte';
            }
            toast.error(<div>
                {`Erro ao ${id ? 'atualizar' : 'criar'} cliente`}
                <br />
                <b>{errorMessage}</b>
            </div>);
            setIsLoading(false)
        }
    }

    const handleSubmitDelete = async () => {
        try {
            setIsLoading(true)
            await axios.delete(`/customers/${id}`);
            setClients(clients.filter(user => user.id !== id));
            toast.success('Cliente deletado com sucesso!');
            setOpenModalDelete(false);
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            console.error(error);
            toast.error('Erro ao deletar cliente');
        }
    }


    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');

        if (!value.startsWith('55')) {
            value = '55' + value;
        }

        value = value.replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})$/, '+$1 ($2) $3-$4');

        if (value.length > 19) {
            value = value.substring(0, 17);
        }

        setTelefone(value);
    };
    return (
        <main className="flex mt-16  w-full flex-col bg-gray-100 p-4 lg:p-10">
            <div className="w-full max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Clientes</h1>
                    <div className="flex gap-2 items-center">
                        <Input
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder="Nome, Email, CPF ou Telefone"
                            className="w-full rounded-md border-gray-300 p-2 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <Button
                            onClick={() => handleCreate()}
                            className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Icon icon="ci:add" className="h-5 w-5 mr-2" /> Criar novo cliente
                        </Button>
                    </div>
                </div>
                <DataTable columns={columns} data={clients} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
            <Modal isLoading={isLoading} title={id ? "Editar Cliente" : "Criar Novo Cliente"} isOpen={openModal} onCancel={() => setOpenModal(false)} onConfirm={() => handleSubmit()}>
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
                <div className="mt-3">
                    <Label >
                        CPF
                    </Label>
                    <Input
                        type="text"
                        placeholder="21501052098"
                        onChange={(e) => setCPF(e.target.value)}
                        value={cpf}
                        className="w-full rounded-md border-gray-300 p-2 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div className="mt-3">
                    <Label >
                        Telefone
                    </Label>
                    <Input
                        type="text"
                        placeholder="+55 (11) 99999-9999"
                        onChange={(e) => handlePhoneChange(e)}
                        value={telefone}
                        className="w-full rounded-md border-gray-300 p-2 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
            </Modal>
            <Modal isLoading={isLoading} title="Deletar Cliente?" isOpen={openModalDelete} onCancel={() => setOpenModalDelete(false)} onConfirm={() => handleSubmitDelete()}>
                <span className="text-sm">
                    Tem certeza que deseja deletar o cliente?
                </span>
            </Modal>
        </main>
    );
}

export default PrivateRoute(ClientsPage);
