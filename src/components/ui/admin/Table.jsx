"use client";
import { useEffect, useState } from "react";
import Pagination from "../../Pagination";

const Table = ({
  headers,
  rows,
  loading,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  renderRow,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = rows.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex-1 overflow-hidden flex flex-col rounded-lg bg-gray-900">
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left border-b border-gray-800">
                {headers.map((header) => (
                  <th key={header.key} className="py-3 px-4 whitespace-nowrap">
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, index) => renderRow(row, index))}
            </tbody>
          </table>
        )}
      </div>

      {isClient && (
        <div className="mt-4 py-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}
    </div>
  );
};

export default Table;