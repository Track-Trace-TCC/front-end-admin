import React from 'react';
import { Icon } from '@iconify/react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from "./table";
interface Column {
    accessor: string;
    Header: string;
    Cell?: (row: any) => React.ReactNode;
}

interface Row {
    id: string;
    [key: string]: any;
}

interface DataTableProps {
    columns: Column[];
    data: Row[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}
const DataTable = ({ columns, data, onEdit, onDelete }: DataTableProps) => {
    return (
        <Table className='bg-white p-12'>
            <TableHeader>
                <TableRow>
                    {columns.map((column) => (
                        <TableHead key={column.accessor}>{column.Header}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row) => (
                    <TableRow key={row.id}>
                        {columns.map((column) => {
                            const cellValue = row[column.accessor];
                            return (
                                <TableCell key={`${row.id}-${column.accessor}`}>
                                    {column.Cell ? column.Cell(row) : cellValue}
                                </TableCell>
                            );
                        })}
                        <TableCell className="flex justify-end space-x-3">
                            <button onClick={() => onEdit(row.id)} className="hover:text-indigo-900">
                                <Icon icon="cil:pencil" className="h-5 w-5" />
                            </button>
                            <button onClick={() => onDelete(row.id)} className="hover:text-red-900">
                                <Icon icon="ph:trash" className="h-5 w-5" />
                            </button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default DataTable;
