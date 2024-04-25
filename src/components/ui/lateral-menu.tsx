import React from 'react';
import Link from 'next/link';
import { usePathname, redirect } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const sidebarClasses = isOpen
    ? "translate-x-0 ease-out"
    : "-translate-x-full ease-in";

  const backdropClasses = isOpen ? "opacity-50" : "opacity-0 pointer-events-none";
  const isActive = (path: string) => {
    return path == pathname;
  };

  const handleNavigation = (path: string) => {
    redirect(path);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black transition-opacity duration-300 ${backdropClasses}`}
        onClick={onClose}
      ></div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 overflow-y-auto bg-white shadow-xl transition-transform duration-300 ${sidebarClasses}
          w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 md:rounded-r-3xl`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-3xl font-bold">Track<span className="text-primary">&</span>Trace</h2>
          <button onClick={onClose} className="text-2xl">×</button>
        </div>
        <nav className="flex-grow p-4">
          <div className="flex items-center">
            <div className={`border-l-4 ${isActive("/") ? "border-primary" : "border-transparent"} pr-2 flex items-center`}>
              <Link href="/" onClick={() => handleNavigation("/")} legacyBehavior>
                <a className="block p-2 text-gray-700 rounded-lg hover:underline cursor-pointer">
                  Início
                </a>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className={`border-l-4 ${isActive("/entregas") ? "border-primary" : "border-transparent"} pr-2 flex items-center`}>
              <Link href="/entregas" onClick={() => handleNavigation("/entregas")} legacyBehavior>
                <a className="block p-2 text-gray-700 rounded-lg hover:underline cursor-pointer">
                  Entregas
                </a>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className={`border-l-4 ${isActive("/motoristas") ? "border-primary" : "border-transparent"} pr-2 flex items-center`}>
              <Link href="/motoristas" onClick={() => handleNavigation("/motoristas")} legacyBehavior>
                <a className="block p-2 text-gray-700 rounded-lg hover:underline cursor-pointer">
                  Motoristas
                </a>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className={`border-l-4 ${isActive("/administradores") ? "border-primary" : "border-transparent"} pr-2 flex items-center`}>
              <Link href="/administradores" onClick={() => handleNavigation("/administradores")} legacyBehavior>
                <a className="block p-2 text-gray-700 rounded-lg hover:underline cursor-pointer">
                  Administradores
                </a>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className={`border-l-4 ${isActive("/rotas") ? "border-primary" : "border-transparent"} pr-2 flex items-center`}>
              <Link href="/rotas" onClick={() => handleNavigation("/rotas")} legacyBehavior>
                <a className="block p-2 text-gray-700 rounded-lg hover:underline cursor-pointer">
                  Rotas
                </a>
              </Link>
            </div>
          </div>
        </nav>
        <div className="p-4 mt-auto">
          {/* Seus links para perfil, configurações, etc. */}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
