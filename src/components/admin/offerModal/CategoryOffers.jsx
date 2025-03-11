import React, { useState } from "react";
import PropTypes from "prop-types";
import { adminAxiosInstance } from "../../../utils/axios";
import { Pencil, Trash } from "lucide-react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import EditOfferModal from "./EditOfferModal";
import toast from "react-hot-toast";
import Table from "../../ui/admin/Table";

export default function CategoryOffers({
  offers,
  onUpdate,
  onDelete,
  totalCategoryOffers,
}) {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const tableHeaders = [
    { key: "name", label: "OFFER NAME" },
    { key: "category", label: "CATEGORY" },
    { key: "value", label: "VALUE" },
    { key: "date", label: "END DATE" },
    { key: "action", label: "ACTION" },
  ];

  const renderUserRow = (offer) => (
    <tr key={offer._id} className="border-b">
      <td className="p-4">{offer.name}</td>
      <td className="p-4">
        {offer.category && typeof offer.category === "object"
          ? offer.category.title
          : offer.category}
      </td>
      <td className="p-4">{offer.value}%</td>
      <td className="p-4">{new Date(offer.endDate).toLocaleDateString()}</td>
      <td className="p-4 flex gap-2">
        <button
          onClick={() => {
            setSelectedOffer(offer);
            setIsEditModalOpen(true);
          }}
        >
          <Pencil size={20} />
        </button>
        <button
          onClick={() => {
            setSelectedOffer(offer);
            setIsDeleteModalOpen(true);
          }}
        >
          <Trash size={20} />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="bg-black rounded-lg shadow p-6">
      {totalCategoryOffers === 0 ? (
        <div className="text-center py-10 text-gray-400">
          No Category offers till now
        </div>
      ) : (
        <Table
          headers={tableHeaders}
          rows={offers}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalCategoryOffers}
          onPageChange={handlePageChange}
          renderRow={renderUserRow}
        />
      )}

      {selectedOffer && (
        <>
          <EditOfferModal
            type="category"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedOffer(null);
            }}
            onOfferUpdated={(updatedOffer) => {
              onUpdate(updatedOffer);
              setIsEditModalOpen(false);
              setSelectedOffer(null);
            }}
            initialData={selectedOffer}
          />

          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedOffer(null);
            }}
            onConfirm={async () => {
              try {
                await adminAxiosInstance.delete(`/offers/${selectedOffer._id}`);
                onDelete(selectedOffer._id);
                setIsDeleteModalOpen(false);
                setSelectedOffer(null);
              } catch (err) {
                toast.error(err.response?.data?.error || err.message);
              }
            }}
            offerName={selectedOffer.name}
          />
        </>
      )}
    </div>
  );
}

CategoryOffers.propTypes = {
  offers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          title: PropTypes.string,
        }),
      ]),
      value: PropTypes.number.isRequired,
      endDate: PropTypes.string.isRequired,
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  totalCategoryOffers:PropTypes.number.isRequired
};
