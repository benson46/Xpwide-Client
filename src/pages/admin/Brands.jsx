import React from "react";
import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import AddBrandModal from "../../components/admin/brandModal/AddBrandMoal";
import EditBrandModal from "../../components/admin/brandModal/EditBrandModal"; // Import the edit modal
import toast from "react-hot-toast";
import { adminAxiosInstance } from "../../utils/axios";
import Table from "../../components/ui/admin/Table";
import ConfirmModal from "../../components/admin/ConfirmModal";

export default function Brands() {
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [isEditBrandModalOpen, setIsEditBrandModalOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBrands, setTotalBrands] = useState(0);
  const itemsPerPage = 10;

  // Confirmation modal state for toggling status
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
  });

  const fetchBrand = async () => {
    try {
      const response = await adminAxiosInstance.get("/brands", {
        params: { page: currentPage, limit: itemsPerPage },
      });
      setBrands(response.data.brands);
      setTotalBrands(response.data.totalBrands);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch brands.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrand();
  }, [currentPage]);

  const handleAddBrand = async (formData) => {
    try {
      const isBrandExist = brands.some(
        (brand) => brand.title.toLowerCase() === formData.title.toLowerCase()
      );
      if (isBrandExist) {
        toast.error("Brand should be unique");
        return;
      }

      await adminAxiosInstance.post("/brands", formData);
      toast.success("Brand added successfully!");
      fetchBrand();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error adding brand.");
    }
  };

  const handleEditBrand = async (updatedBrand) => {
    try {
      if (updatedBrand) {
        const isBrandExist = brands.some((brand) => {
          return (
            brand.title.toLowerCase() === updatedBrand.title.toLowerCase() &&
            brand._id !== updatedBrand._id
          );
        });

        if (isBrandExist) {
          toast.error("Brand should be unique");
          return;
        }

        await adminAxiosInstance.put(
          `/brands/${updatedBrand._id}`,
          updatedBrand
        );
        fetchBrand();
        toast.success("Brand updated successfully!");
      } else {
        toast.error("Brand is unlisted");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error updating brand.");
    }
  };

  // Original function to update status
  const toggleStatus = async (id) => {
    try {
      await adminAxiosInstance.patch("/brands", { brandId: id });
      fetchBrand();
      toast.success("Status updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status.");
    }
  };

  // Wrap toggleStatus with confirmation
  const handleToggleStatus = (brand) => {
    setConfirmModal({
      isOpen: true,
      title: brand.isBlocked ? "List Brand" : "Unlist Brand",
      message: `Are you sure you want to ${
        brand.isBlocked ? "list" : "unlist"
      } the brand "${brand.title}"?`,
      onConfirm: async () => {
        await toggleStatus(brand._id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () =>
        setConfirmModal((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const tableHeaders = [
    { key: "brand", label: "BRAND" },
    { key: "description", label: "DESCRIPTION" },
    { key: "action", label: "ACTION" },
  ];

  const renderUserRow = (brand) => (
    <tr key={brand._id} className="border-b border-gray-800">
      <td className="py-3 px-4">{brand.title}</td>
      <td className="py-3 px-4 text-center">
        {(brand.description || "No description available")
          .split(" ")
          .map((word, index) => (
            <span key={index}>
              {word}
              {index === 2 ? <br /> : " "}
            </span>
          ))}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button
            className={`px-4 py-1 rounded-md text-sm font-medium ${
              brand.isBlocked
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
            onClick={() => handleToggleStatus(brand)}
          >
            {brand.isBlocked ? "List" : "Unlist"}
          </button>
          <button
            className="p-1 hover:bg-gray-800 rounded"
            onClick={() => {
              setSelectedBrand(brand);
              setIsEditBrandModalOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="flex">
        <Sidebar activePage="Brands" isCollapsed={isCollapsed} />
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">BRANDS</h1>
          </div>
          <button
            onClick={() => setIsAddBrandModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Brand
          </button>
          {/* Table Container */}
          <Table
            headers={tableHeaders}
            rows={brands}
            loading={loading}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalBrands}
            onPageChange={handlePageChange}
            renderRow={(brand) => renderUserRow(brand)}
          />
        </main>
      </div>
      <AddBrandModal
        isOpen={isAddBrandModalOpen}
        onClose={() => setIsAddBrandModalOpen(false)}
        onSubmit={handleAddBrand}
      />
      <EditBrandModal
        isOpen={isEditBrandModalOpen}
        onClose={() => setIsEditBrandModalOpen(false)}
        brand={selectedBrand}
        onUpdate={handleEditBrand}
      />
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
        />
      )}
    </div>
  );
}
