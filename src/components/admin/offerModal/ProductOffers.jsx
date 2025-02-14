"use client";
import { useState, useEffect } from "react";
import { adminAxiosInstance } from "../../../utils/axios";
import { Pencil, Trash } from "lucide-react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import EditOfferModal from "./EditOfferModal";
import toast from "react-hot-toast";
import Table from "../../ui/admin/Table";

export default function ProductOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOffers();
  }, [currentPage]);

  const fetchOffers = async () => {
    try {
      const res = await adminAxiosInstance.get("/offers/getoffers?type=product", {
        params: { page: currentPage, limit: itemsPerPage },
      });
      setOffers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (error) return <div className="text-red-500">{error}</div>;

  const tableHeaders = [
    { key: "name", label: "OFFER NAME" },
    { key: "product", label: "PRODUCT" },
    { key: "value", label: "VALUE" },
    { key: "date", label: "END DATE" },
    { key: "action", label: "ACTION" },
  ];

  const renderUserRow = (offer) => (
    <tr key={offer._id} className="border-b">
      <td className="p-4">{offer.name}</td>
      <td className="p-4">
        {offer.product && typeof offer.product === "object"
          ? offer.product.name
          : offer.product}
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
      <Table
        headers={tableHeaders}
        rows={offers}
        loading={loading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={offers.length} // Replace with real total if available
        onPageChange={handlePageChange}
        renderRow={renderUserRow}
      />

      {selectedOffer && (
        <>
          <EditOfferModal
            type="product"
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedOffer(null);
            }}
            onOfferCreated={fetchOffers}
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
                fetchOffers();
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
