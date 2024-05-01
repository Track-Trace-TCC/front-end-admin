'use client'

import { useEffect, useState } from "react";
import PrivateRoute from "./utils/private-route";
import { Button } from "@/components/ui/button";
import axios from "./lib/axios";
import { toast } from "sonner";

interface DashboardReport {
  totalEntregas: number;
  entregasAndamento: number,
  entregasFinalizadas: number,
  entregasEsperandoColeta: number,
  motoristasCadastrados: number,
  clientesCadastrados: number,
  motoristasDisponiveis: number,
  motoristasEmEntrega: number
}
interface CardProps {
  number: number;
  description: string;
}

const Card: React.FC<CardProps> = ({ number, description }) => (
  <div className="relative bg-white rounded-lg shadow-md p-3 flex flex-col items-start justify-center w-full h-28">
    <h3 className="text-2xl font-bold text-gray-900">{number}</h3>
    <p className="text-sm text-gray-600 mt-1">{description}</p>
    <div className="absolute top-2 right-2 text-gray-400">
      {/* Ícone aqui, se necessário */}
    </div>
  </div>
);
function Home() {
  const [report, setReport] = useState<DashboardReport>()

  useEffect(() => {
    axios.get('report').then(response => {
      setReport(response.data)
    }).catch(error => {
      console.error(error)
      toast.error('Erro ao carregar relatório')
    })
  }, [axios])

  return (
    <div className="mt-16 ">
      <h1 className="p-4 text-xl lg:text-2xl font-bold text-gray-800">Inicio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
        <Card number={report?.totalEntregas ?? 0} description="Entregas totais do sistema" />
        <Card number={report?.entregasAndamento ?? 0} description="Entregas em andamento" />
        <Card number={report?.entregasFinalizadas ?? 0} description="Entregas finalizadas" />
        <Card number={report?.entregasEsperandoColeta ?? 0} description="Entregas esperando coleta" />
        <Card number={report?.motoristasCadastrados ?? 0} description="Motoristas cadastrados" />
        <Card number={report?.clientesCadastrados ?? 0} description="Clientes cadastrados" />
        <Card number={report?.motoristasDisponiveis ?? 0} description="Motoristas disponíveis" />
        <Card number={report?.motoristasEmEntrega ?? 0} description="Motoristas em entrega" />
      </div>
    </div>
  );
}

export default PrivateRoute(Home);
