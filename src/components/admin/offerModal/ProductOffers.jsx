"use client";
import { useState, useEffect } from "react";
import { adminAxiosInstance } from "../../../utils/axios";
import { Pencil, Trash } from "lucide-react";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import AddNewOfferModal from "./AddNewOfferModal";
import EditOfferModal from "./EditOfferModal";
import toast from "react-hot-toast";

export default function ProductOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await adminAxiosInstance.get("/offers/getoffers?type=product");
      setOffers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };


  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-black rounded-lg shadow p-6">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-4">Offer Name</th>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Value</th>
              <th className="text-left p-4">End Date</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.length > 0 ? (
              offers.map((offer) => (
                <tr key={offer._id} className="border-b">
                  <td className="p-4">{offer.name}</td>
                  <td className="p-4">{offer.product?.name}</td>
                  <td className="p-4">{offer.value}%</td>
                  <td className="p-4">
                    {new Date(offer.endDate).toLocaleDateString()}
                  </td>
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
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No product offers available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

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