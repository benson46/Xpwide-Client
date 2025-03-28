import React, { useCallback, useMemo } from "react";
import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import AddBrandModal from "../../components/admin/brandModal/AddBrandModal";
import EditBrandModal from "../../components/admin/brandModal/EditBrandModal";
import toast from "react-hot-toast";
import { adminAxiosInstance } from "../../utils/axios";
import Table from "../../components/ui/admin/Table";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { debounce } from "lodash";

export default function Brands() {
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [isEditBrandModalOpen, setIsEditBrandModalOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBrands, setTotalBrands] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const itemsPerPage = 5;

  // Confirmation modal state for toggling status
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
  });

  const searchBrand = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await adminAxiosInstance.get("/brand/search", {
        params: { query: query.trim() },
      });
      setSearchResults(response.data.data);
    } catch (error) {
      toast.error("Failed to search brand");
      console.error("Search Error : ", error);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(searchBrand, 500),
    [searchBrand]
  );

  // Add search effect
  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const fetchBrand = async () => {
    try {
      const response = await adminAxiosInstance.get("/brands", {
        params: { page: currentPage, limit: itemsPerPage },
      });
      setBrands(response.data.brands);
      setTotalBrands(response.data.totalBrands);
    } catch (err) {
      console.error("Error fetching brand : ", err);
      toast.error("Failed to fetch brands.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchResults.length > 0) return;
    setLoading(true);
    fetchBrand();
  }, [currentPage, searchResults.length]);

  const handleAddBrand = async (formData) => {
    try {
      const isBrandExist = brands.some(
        (brand) => brand.title.toLowerCase() === formData.title.toLowerCase()
      );
      if (isBrandExist) {
        toast.error("Brand should be unique");
        return;
      }

      const response = await adminAxiosInstance.post("/brands", formData);
      if (response.data.success) {
        toast.success("Brand added successfully!");
        setBrands((prevBrands) => [...prevBrands, response.data.brand]);
        setTotalBrands((prevTotal) => prevTotal + 1);
      } else {
        toast.error(response.data.message || "Error adding brand.");
      }
    } catch (err) {
      console.error("Error adding new brand : ", err);
      toast.error(err.response?.data?.message || "Error adding brand.");
    }
  };

  const handleEditBrand = async (updatedBrand) => {
    try {
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

      console.log(updatedBrand);
      const response = await adminAxiosInstance.put(
        `/brands/${updatedBrand._id}`,
        updatedBrand
      );

      console.log(response);
      if (response.data.success) {
        setBrands((prevBrands) =>
          prevBrands.map((brand) =>
            brand._id === updatedBrand._id ? updatedBrand : brand
          )
        );
        toast.success("Brand updated successfully!");
      } else {
        toast.error(response.data.message || "Error updating brand.");
      }
    } catch (err) {
      console.error("Error updating brand : ", err);
      toast.error(err.response?.data?.message || "Error updating brand.");
    }
  };

  // Original function to update status
  const toggleStatus = async (id) => {
    try {
      const response = await adminAxiosInstance.patch("/brands", {
        brandId: id,
      });
      if (response.data.success) {
        setBrands((prevBrands) =>
          prevBrands.map((brand) =>
            brand._id === id ? { ...brand, isBlocked: !brand.isBlocked } : brand
          )
        );
        toast.success("Status updated successfully!");
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      console.error("Error listing or unlisting brand : ", err);
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
      onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="w-full">
        <Navbar toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex flex-1">
        <div className="sm:block">
          <Sidebar activePage="Brands" isCollapsed={isCollapsed} />
        </div>
        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">BRANDS</h1>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="p-2 rounded bg-gray-800 text-white outline-none w-64"
              />
              <button
                onClick={() => setIsAddBrandModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Brand
              </button>
            </div>
          </div>
          {/* Table Container */}
          {!loading && totalBrands === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No brands till now
            </div>
          ) : (
            <Table
              headers={tableHeaders}
              rows={searchQuery ? searchResults : brands}
              loading={loading}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={
                searchResults > 0 ? searchResults.length : totalBrands
              }
              onPageChange={handlePageChange}
              renderRow={(brand) => renderUserRow(brand)}
            />
          )}
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
