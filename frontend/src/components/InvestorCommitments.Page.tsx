import React, { useState, useEffect, useMemo } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import {
    useReactTable,
    getCoreRowModel,
    ColumnDef,
    flexRender,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    FilterFn,
    Column,
    OnChangeFn,
} from '@tanstack/react-table';
import { Link, useParams } from 'react-router-dom';
import { formatNumber } from '../utils/utility';
import { InvestorAPI } from '../api/InvestorApi';
import { Commitment } from '../models/Commitment';


const InvestorCommitmentsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<Commitment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [assetClassTotals, setAssetClassTotals] = useState<{ [assetClass: string]: number }>({});

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await InvestorAPI.getCommitments(id!);
                setData(response);
                calculateAssetClassTotals(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const calculateAssetClassTotals = (commitments: Commitment[]) => {
        const totals: { [assetClass: string]: number } = {};
        commitments.forEach((commitment) => {
            if (totals[commitment.asset_class]) {
                totals[commitment.asset_class] += commitment.amount;
            } else {
                totals[commitment.asset_class] = commitment.amount;
            }
        });
        setAssetClassTotals(totals);
    };


    const columns: ColumnDef<Commitment>[] = useMemo(
        () => [
            { header: 'Id', accessorKey: 'id' },
            { header: 'Asset Class', accessorKey: 'asset_class' },
            { header: 'Currency', accessorKey: 'currency' },
            { header: 'Amount', accessorFn: row => formatNumber(row.amount) },
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: fuzzyFilter, // Use fuzzy filter
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const allTotal = Object.values(assetClassTotals).reduce((sum, value) => sum + value, 0);


    return (
        <div className='px-15 py-10'>
            <div className="flex items-center mb-4">
                <Link to="/" className="mr-2 flex items-center"> {/* Use Link */}
                    <FaArrowLeft size={30} />
                </Link>
                <h2 className="text-4xl font-semibold">Commitments</h2>
            </div>

            <div className="flex flex-wrap justify-center mb-4">
                <div className="p-4 border rounded m-2 shadow-md bg-white">
                    <div className="text-center font-semibold">All</div>
                    <div className="text-center">{formatNumber(allTotal)}</div>
                </div>
                {Object.entries(assetClassTotals).map(([assetClass, total]) => (
                    <div key={assetClass} className="p-4 border rounded m-2 shadow-md bg-white">
                        <div className="text-center font-semibold">{assetClass}</div>
                        <div className="text-center">{formatNumber(total)}</div>
                    </div>
                ))}
            </div>

            <div className="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md rounded-xl bg-clip-border">
                <div className="mx-5 mt-5 mb-2">
                    <div className='flex justify-end'>
                        <input
                            type="text"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Filter all columns..."
                            className="p-2 border rounded"
                        />
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => {
                                table.setPageSize(Number(e.target.value))
                            }}
                            className='p-2 ml-2 border rounded'
                        >
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    Show {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <table className="text-left table-auto mx-5 mb-5 border border-gray-200 rounded bg-clip-border">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className='p-4 border-b border-blue-gray-100 bg-blue-gray-50'>
                                        <div onClick={header.column.getToggleSortingHandler()} style={{ cursor: 'pointer' }}>
                                            <p className='block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70'>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getIsSorted() ? (header.column.getIsSorted() === 'desc' ? ' 🔽' : ' 🔼') : ''}
                                            </p>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className={row.index % 2 === 0 ? 'bg-gray-50' : ''}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className='p-4 border-b border-blue-gray-50'>
                                        <p className='block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70'>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </p>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="p-4 flex justify-between items-center">
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-2 border rounded">
                        Previous
                    </button>
                    <span>
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-2 border rounded">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value) => {
    const cellValue = row.getValue<any>(columnId);
    if (cellValue === undefined || cellValue === null) {
        return false;
    }
    const cellValueStr = typeof cellValue === 'string' ? cellValue : cellValue.toString();
    return cellValueStr.toLowerCase().includes(value.toLowerCase());
};


export default InvestorCommitmentsPage;