import React,{ useState, useEffect } from "react";
import ProductOffers from "../../components/admin/offerModal/ProductOffers";
import CategoryOffers from "../../components/admin/offerModal/CategoryOffers";
import AddNewOfferModal from "../../components/admin/offerModal/AddNewOfferModal";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import { adminAxiosInstance } from "../../utils/axios";

export default function Offer() {
  const [activeTab, setActiveTab] = useState("product");
  const [showModal, setShowModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Added states for offers
  const [productOffers, setProductOffers] = useState([]);
  const [categoryOffers, setCategoryOffers] = useState([]);
  const [totalCategoryOffers,setTotalCategoryOffers] = useState(0);
  const [totalProductOffers,setTotalProductOffers] = useState(0);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await adminAxiosInstance.get(
          `/offers/getoffers?type=${activeTab}`
        );
        if (activeTab === "product") {
          setProductOffers(res.data.data);
          setTotalProductOffers(res.data.totalProductOffers)
        } else {
          setCategoryOffers(res.data.data);
          setTotalCategoryOffers(res.data.totalCategoryOffers)
        }
      } catch (err) {
        console.error("Error fetching offers:", err);
      }
    };
    fetchOffers();
  }, [activeTab]);

  const handleNewOffer = (newOffer) => {
    if (activeTab === "product") {
      setProductOffers((prev) => [...prev, newOffer]);
      setTotalProductOffers((prev) => prev +1)
    } else {
      setCategoryOffers((prev) => [...prev, newOffer]);
      setTotalCategoryOffers((prev) => prev +1)

    }
  };

  const handleUpdateOffer = (updatedOffer) => {
    if (activeTab === "product") {
      setProductOffers((prev) =>
        prev.map((offer) =>
          offer._id === updatedOffer._id ? updatedOffer : offer
        )
      );

      setTotalProductOffers((prev) => prev +1)
    } else {
      setCategoryOffers((prev) =>
        prev.map((offer) =>
          offer._id === updatedOffer._id ? updatedOffer : offer
        )
      );
    }
  };

  const handleDeleteOffer = (deletedId) => {
    if (activeTab === "product") {
      setProductOffers((prev) =>
        prev.filter((offer) => offer._id !== deletedId)
      );
    } else {
      setCategoryOffers((prev) =>
        prev.filter((offer) => offer._id !== deletedId)
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="flex">
        <div className="sm:block">
          <Sidebar activePage="Offers" isCollapsed={isCollapsed} />
        </div>

        <main className="flex-1 p-6 max-w-6xl mx-auto bg-black">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Offer Management</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
            >
              + Add New Offer
            </button>
          </div>

          <div className="border-b mb-6">
            <button
              className={`px-4 py-2 mr-4 ${
                activeTab === "product" ? "border-b-2 border-yellow-400" : ""
              }`}
              onClick={() => setActiveTab("product")}
            >
              Product Offers
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === "category" ? "border-b-2 border-yellow-400" : ""
              }`}
              onClick={() => setActiveTab("category")}
            >
              Category Offers
            </button>
          </div>

          {activeTab === "product" ? (
            <ProductOffers
              offers={productOffers}
              onUpdate={handleUpdateOffer}
              onDelete={handleDeleteOffer}
              totalProductOffers = {totalProductOffers}
            />
          ) : (
            <CategoryOffers
              offers={categoryOffers}
              onUpdate={handleUpdateOffer}
              onDelete={handleDeleteOffer}
              totalCategoryOffers = {totalCategoryOffers}
            />
          )}
          {showModal && (
            <AddNewOfferModal
              type={activeTab}
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onOfferCreated={handleNewOffer}
            />
          )}
        </main>
      </div>
    </div>
  );
}
