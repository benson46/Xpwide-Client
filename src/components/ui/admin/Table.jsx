import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
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
 
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      console.log("Changing to page:", newPage);
      onPageChange(newPage);
    }
  };

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
              {rows.map((row) => renderRow(row))}</tbody>
          </table>
        )}
      </div>

      {isClient && (
        <div className="mt-4 py-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange} // ✅ Pass full page change function
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}
    </div>
  );
};

Table.propTypes = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  rows: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  currentPage: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  setItemsPerPage: PropTypes.func.isRequired,
  renderRow: PropTypes.func.isRequired,
};

export default Table;
