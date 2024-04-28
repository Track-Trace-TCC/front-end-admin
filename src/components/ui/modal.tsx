import React, { FC, useRef, useEffect, ReactNode } from 'react';
import { Button } from './button';

interface ModalProps {
    isOpen: boolean;
    title: string;
    children: ReactNode;
    isLoading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const Modal: FC<ModalProps> = ({ isOpen, title, children, isLoading, onConfirm, onCancel }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const trigger = document.querySelector('[data-radix-dropdown-menu-trigger]');

        if (
            modalRef.current &&
            !modalRef.current.contains(target) &&
            trigger &&
            !trigger.contains(target)
        ) {
            onCancel();
        }
    };


    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 backdrop-blur-md flex items-center justify-center">
            <div className="relative p-8 bg-white w-full max-w-md rounded-lg" ref={modalRef}>
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">{title}</h1>
                    <button onClick={onCancel} className="text-gray-700 font-semibold">
                        X
                    </button>
                </div>
                <div className="my-4">
                    {children}
                </div>
                <div className="flex justify-end gap-4">
                    <Button
                        isLoading={isLoading}
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md bg-white hover:bg-gray-100 border border-gray-300 text-gray-600"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={onConfirm}
                        isLoading={isLoading}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white"
                    >
                        Confirmar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
