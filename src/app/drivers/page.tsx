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
import { reverseGeocode } from "../utils/reverseGeocode";

const columns = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Nome', accessor: 'nome' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'CNH', accessor: 'cnh' },
    { Header: 'Telefone', accessor: 'telefone' },
    { Header: 'Localização Atual', accessor: 'formatted_address' },
];

interface Location {
    lat: number;
    lng: number;
}

interface Driver {
    id: string
    nome: string
    email: string
    cnh: string
    telefone: string
    password?: string
    localizacaoAtual?: Location;
    formatted_address?: string;
}
function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [search, setSearch] = useState<string>('')
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')
    const [cnh, setCNH] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [telefone, setTelefone] = useState<string>('')
    const [name, setName] = useState<string>('')
    const [id, setId] = useState<string>('')
    const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const handleEdit = (driverId: string) => {
        setId(driverId)
        const driver: Driver | undefined = drivers.find((driver: Driver) => driver.id === driverId)
        if (!driver) {
            return
        }
        setEmail(driver.email || '')
        setName(driver.nome || '')
        setTelefone(driver.telefone || '')
        setCNH(driver.cnh || '')
        setOpenModal(true)
    };

    const handleCreate = () => {
        setId('')
        setEmail('')
        setTelefone('')
        setPassword('')
        setName('')
        setCNH('')
        setOpenModal(true)
    }

    const handleDelete = (driverId: string) => {
        setId(driverId)
        setOpenModalDelete(true)
    };

    useEffect(() => {
        async function fetchDrivers() {
            try {
                const response = await axios.get(`/drivers?search=${search}`);
                const driversData: Driver[] = response.data;

                const driversWithLocation: Driver[] = await Promise.all(
                    driversData.map(async (driver) => {
                        if (driver.localizacaoAtual?.lat && driver.localizacaoAtual?.lng) {
                            const { city, neighborhood } = await reverseGeocode(driver.localizacaoAtual.lat, driver.localizacaoAtual.lng);
                            const formattedLocation = `${neighborhood}, ${city}`;
                            return { ...driver, formatted_address: formattedLocation };
                        } else {
                            return { ...driver, formatted_address: 'Sem viagem iniciada' };
                        }
                    })
                );

                setDrivers(driversWithLocation);
            } catch (error) {
                console.error('Erro ao buscar motoristas:', error);
                toast.error('Não foi possível buscar motoristas');
            }
        }

        fetchDrivers();
    }, [search]);

    const handleSubmit = async () => {
        if (!email || !name || !cnh || !telefone) {
            toast.error('Preencha todos os campos')
            return
        }

        setIsLoading(true)
        try {
            let action = id ? 'editado' : 'criado';
            let response: any;
            if (id) {
                response = await axios.patch(`/drivers/${id}`, { email, nome: name, telefone, cnh });
                setDrivers(drivers.map(driver => driver.id === id ? {
                    ...driver,
                    email: response.data.email,
                    nome: response.data.nome,
                    telefone: response.data.telefone,
                    cpf: response.data.cpf
                } : driver));
            } else {
                response = await axios.post(`/drivers`, { email, nome: name, telefone, cnh, password });
                setDrivers([...drivers, {
                    id: response.data.id_Motorista,
                    email,
                    cnh: response.data.cnh,
                    telefone: response.data.telefone,
                    nome: response.data.nome
                }]);

            }
            setIsLoading(false)
            toast.success(`Motorista ${action} com sucesso!`);
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
                {`Erro ao ${id ? 'atualizar' : 'criar'} motorista`}
                <br />
                <b>{errorMessage}</b>
            </div>);
            setIsLoading(false)
        }
    }

    const handleSubmitDelete = async () => {
        try {
            setIsLoading(true)
            await axios.delete(`/drivers/${id}`);
            setDrivers(drivers.filter(driver => driver.id !== id));
            toast.success('Motorista deletado com sucesso!');
            setOpenModalDelete(false);
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            console.error(error);
            toast.error('Erro ao deletar motorista');
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
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Motorista</h1>
                    <div className="flex gap-2 items-center">
                        <Input
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder="Nome, Email, CNH ou Telefone"
                            className="w-full rounded-md border-gray-300 p-2 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <Button
                            onClick={() => handleCreate()}
                            className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Icon icon="ci:add" className="h-5 w-5 mr-2" /> Criar novo motorista
                        </Button>
                    </div>
                </div>
                <DataTable columns={columns} data={drivers} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
            <Modal isLoading={isLoading} title={id ? "Editar Motorista" : "Criar Novo Motorista"} isOpen={openModal} onCancel={() => setOpenModal(false)} onConfirm={() => handleSubmit()}>
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
                <div className="mt-3">
                    <Label >
                        CNH
                    </Label>
                    <Input
                        type="text"
                        placeholder="12345678900"
                        onChange={(e) => setCNH(e.target.value)}
                        value={cnh}
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

export default PrivateRoute(DriversPage);
