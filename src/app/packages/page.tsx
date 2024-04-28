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
import { geocodeAddress, reverseGeocode } from "../utils/reverseGeocode";

import { DropdownSelect } from "@/components/ui/dropdown-menu";
import { set } from "date-fns";
import { AxiosError } from "axios";

const columns = [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Nome do Cliente', accessor: 'client_name' },
    { Header: 'Destino', accessor: 'formatted_destiny' },
    { Header: 'Código Rastreio', accessor: 'package_code' },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Data Entrega', accessor: 'data_entrega' },
];

interface Location {
    lat: number;
    lng: number;
}

enum Status {
    A_CAMINHO = 'A Caminho',
    ENTREGUE = 'Entregue',
    ESPERANDO_RETIRADA = 'Aguardando retirada',
}
interface Package {
    id: string;
    client_name?: string;
    client_id?: string;
    package_code?: string;
    status?: string;
    destino?: Location;
    data_entrega?: string;
    formatted_destiny?: string;
}

interface PackageApiResponse {
    id: string;
    origem: Location;
    destino: string;
    status: Status;
    codigo_Rastreio: string;
    data_Criacao: string;
    data_Atualizacao: string;
    cliente: {
        id: string;
        nome: string;
        cpf: string;
        email: string;
    };
    motorista: {
        id: string;
        nome: string;
        cnh: string;
        email: string;
    };
    data_Entrega: string;
}

interface Client {
    id: string;
    nome: string;
}
function formatStatus(status: Status): string {
    return status.split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
}

async function transformPackageData(apiData: PackageApiResponse): Promise<Package> {
    const destinyJson = JSON.parse(apiData.destino);
    console.log(destinyJson);
    const formattedDestiny = await reverseGeocode(destinyJson.latitude, destinyJson.longitude);


    const dateFormatted = apiData.data_Entrega ? new Date(apiData.data_Entrega).toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }) : 'Não entregue';

    return {
        id: apiData.id,
        client_name: apiData.cliente.nome,
        client_id: apiData.cliente.id,
        package_code: apiData.codigo_Rastreio,
        status: formatStatus(apiData.status),
        destino: destinyJson,
        data_entrega: dateFormatted,
        formatted_destiny: formattedDestiny ?? 'Não foi possível obter o endereço',
    };
}

function PackagesPage() {
    const [packages, setPackage] = useState<Package[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [search, setSearch] = useState<string>('')
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [id, setId] = useState<string>('')
    const [address, setAddress] = useState<string>('')
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [openModalDelete, setOpenModalDelete] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const handleEdit = (packageID: string) => {
        setId(packageID)
        setSelectedClientId(packages.find((packageAux: Package) => packageAux.id === packageID)?.client_id ?? '')
        const driver: Package | undefined = packages.find((packageAux: Package) => packageAux.id === packageID)
        if (!driver) {
            return
        }
        setOpenModal(true)
    };

    const handleCreate = () => {
        setId('')
        setAddress('')
        setSelectedClientId('')
        setOpenModal(true)
    }

    const handleDelete = (packageId: string) => {
        setId(packageId)
        setOpenModalDelete(true)
    };
    const handleClientSelect = (clientId: string) => {
        setSelectedClientId(clientId);

    };
    async function fetchPackages() {
        try {
            const response = await axios.get<PackageApiResponse[]>(`/package?search=${search}`);
            const packages = await Promise.all(response.data.map(transformPackageData));
            setPackage(packages);
        } catch (error) {
            console.error('Erro ao buscar pacotes:', error);
            toast.error('Não foi possível buscar pacotes');
        }
    }
    useEffect(() => {

        async function fetchClients() {
            try {
                const response = await axios.get<Client[]>('/customers');
                setClients(response.data);
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
                toast.error('Não foi possível buscar clientes');
            }
        }
        fetchClients();
        fetchPackages();
    }, [search]);

    const handleSubmit = async () => {
        setIsLoading(true);
        if (!selectedClientId || !address) {
            toast.error('Preencha todos os campos');
            setIsLoading(false);
            return;
        }
        try {
            const geocodeResponse = await geocodeAddress(address);

            const newPackageData = {
                destino: {
                    latitude: geocodeResponse.latitude,
                    longitude: geocodeResponse.longitude,
                },
                idCliente: selectedClientId,
            };

            let response;
            response = await axios.post('/package', newPackageData);
            toast.success(`Pacote criado com sucesso!`);
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
                {`Erro ao criar pacote`}
                <br />
                <b>{errorMessage}</b>
            </div>);
            setIsLoading(false)
        }
        fetchPackages();
        setIsLoading(false);
        setOpenModal(false);
    };

    const handleSubmitDelete = async () => {
        try {
            setIsLoading(true)
            await axios.delete(`/package/${id}`);
            setPackage(packages.filter(auxPackage => auxPackage.id !== id));
            toast.success('Pacote deletado com sucesso!');
            setOpenModalDelete(false);
            setIsLoading(false)
        } catch (error) {
            setIsLoading(false)
            console.error(error);
            toast.error('Erro ao deletar pacote');
        }
    }

    return (
        <main className="flex mt-16  w-full flex-col bg-gray-100 p-4 lg:p-10">
            <div className="w-full max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Pacotes</h1>
                    <div className="flex gap-2 items-center">
                        <Input
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder="Nome, codigo"
                            className="w-full rounded-md border-gray-300 p-2 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <Button
                            onClick={() => handleCreate()}
                            className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white transition duration-150 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Icon icon="ci:add" className="h-5 w-5 mr-2" /> Criar novo pacote
                        </Button>
                    </div>
                </div>
                <DataTable isNotRowEditable columns={columns} data={packages} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
            <Modal isLoading={isLoading} title={id ? "Editar pacote" : "Criar Novo Pacote"} isOpen={openModal} onCancel={() => setOpenModal(false)} onConfirm={() => handleSubmit()}>
                <Label>
                    Endereço de entrega
                </Label>
                <Input
                    type="text"
                    placeholder="Goiania, goias, rua 260 numero 470"
                    onChange={(e) => setAddress(e.target.value)}
                    value={address}
                    className="w-full rounded-md border-gray-300 p-2 bg-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <div className="mt-3">
                    <Label >
                        Cliente dono do pacote
                    </Label>
                    <DropdownSelect
                        selectedId={selectedClientId}
                        items={clients.map((client) => ({ label: client.nome, id: client.id }))}
                        placeholder="Selecione um cliente"
                        onChange={handleClientSelect}
                    />
                </div>
            </Modal>
            <Modal isLoading={isLoading} title="Deletar Pacote?" isOpen={openModalDelete} onCancel={() => setOpenModalDelete(false)} onConfirm={() => handleSubmitDelete()}>
                <span className="text-sm">
                    Tem certeza que deseja deletar o pacote?
                </span>
            </Modal>
        </main>
    );
}

export default PrivateRoute(PackagesPage);
