import React from "react";
import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import AddBrandModal from "../../components/admin/brandModal/AddBrandMoal";
import EditBrandModal from "../../components/admin/brandModal/EditBrandModal"; // Import the edit modal
import toast from "react-hot-toast";
import { adminAxiosInstance } from "../../utils/axios";
import Pagination from "../../components/Pagination";

export default function Brands() {
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [isEditBrandModalOpen, setIsEditBrandModalOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBrand = async () => {
    try {
      const response = await adminAxiosInstance.get("/brands");
      setBrands(response.data.brands || []);
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch brands.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrand();
  }, []);

  const handleAddBrand = async (formData) => {
    try {
      const isBrandExist = brands.some(
        (brand) => brand.title.toLowerCase() === formData.title.toLowerCase()
      );
      console.log(isBrandExist);

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
          if (
            brand.title.toLowerCase() === updatedBrand.title.toLowerCase() &&
            brand._id != updatedBrand._id
          ) {
            return true;
          }
          return false;
        });
        console.log(isBrandExist);

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

  const totalPages = Math.ceil(brands.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = brands.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="flex">
        <Sidebar activePage="Brands" />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Brands Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">BRANDS</h1>
              <button
                onClick={() => setIsAddBrandModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Brand
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg bg-gray-900">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-800">
                      <th className="text-left py-3 px-4">Brand</th>
                      <th className="py-3 px-4 text-center">DESCRIPTION</th>
                      <th className="py-3 px-4">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.length > 0 ? (
                      brands.map((brand, index) => (
                        <tr key={index} className="border-b border-gray-800">
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
                                onClick={() => toggleStatus(brand._id)}
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4">
                          No brands available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={brands.length}
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
    </div>
  );
}
