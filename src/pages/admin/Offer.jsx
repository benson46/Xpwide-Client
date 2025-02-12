"use client";

import { useState } from "react";
import ProductOffers from "../../components/admin/offerModal/ProductOffers";
import CategoryOffers from "../../components/admin/offerModal/CategoryOffers";
import AddNewOfferModal from "../../components/admin/offerModal/AddNewOfferModal";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";

export default function Offer() {
  const [activeTab, setActiveTab] = useState("product");
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex">
        <Sidebar activePage="Offers" />

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
            <ProductOffers key={refreshKey} />
          ) : (
            <CategoryOffers key={refreshKey} />
          )}

          {showModal && (
            <AddNewOfferModal
              type={activeTab}
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onOfferCreated={() => setRefreshKey((prev) => prev + 1)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
