import React, { useState, useEffect, useMemo } from 'react';
import axios, { AxiosResponse } from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../utils/utility';
import { InvestorAPI } from '../api/InvestorApi';



const InvestorsPage: React.FC = () => {
  const [data, setData] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const investors = await InvestorAPI.getInvestors();
        setData(investors);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns: ColumnDef<Investor>[] = useMemo(
    () => [
      { header: 'Id', accessorKey: 'id' },
      { header: 'Name', accessorKey: 'name' },
      { header: 'Type', accessorKey: 'type' },
      { header: 'Date Added', accessorKey: 'date_added' },
      { header: 'Country', accessorKey: 'country' },
      { header: 'Total Commitment', accessorFn: row => formatNumber(row.total_commitment), },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleRowClick = (id: number) => {
    navigate(`/investors/${id}`); // Navigate to the detail page
  };

  return (
    <div className='p-10'>
      <h2 className="text-xl font-semibold mb-2">Investors</h2>
      <div className="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md rounded-xl bg-clip-border">
        <table className="text-left table-auto m-5 border border-gray-200 rounded bg-clip-border">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className='p-4 border-b border-blue-gray-100 bg-blue-gray-50'>
                    <p className='block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70'>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </p>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={row.index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100 cursor-pointer' : 'hover:bg-gray-100 cursor-pointer'} // Add hover and cursor styles
                onClick={() => handleRowClick(row.original.id)} // Add onClick handler
              >
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
      </div>
    </div>
  );
};

export default InvestorsPage;