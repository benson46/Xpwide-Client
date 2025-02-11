import React from "react";
import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import AddCategoryModal from "../../components/admin/categoryModal/AddCategoryModal";
import EditCategoryModal from "../../components/admin/categoryModal/EditCategoryModal";
import toast from "react-hot-toast";
import { adminAxiosInstance } from "../../utils/axios";
import Pagination from "../../components/Pagination";

export default function Categories() {
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCategories, setTotalCategories] = useState(0);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCategory = async () => {
    try {
      const response = await adminAxiosInstance.get("/category");
      setCategories(response.data.categories || []);
      setTotalCategories(
        response.data.totalCategories || response.data.categories.length
      ); // Fix here
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleAddCategory = async (formData) => {
    try {
      const isCategoryExist = categories.some(
        (category) =>
          category.title.toLowerCase() === formData.title.toLowerCase()
      );

      if (isCategoryExist) {
        toast.error("Category should be unique");
        return;
      }

      await adminAxiosInstance.post("/category", formData);
      toast.success("Category added successfully!");
      fetchCategory();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error adding category.");
    }
  };

  const handleEditCategory = async (updatedCategory) => {
    try {
      const isCategoryExist = categories.some((category) => {
        if (
          category.title.toLowerCase() === updatedCategory.title.toLowerCase()
        ) {
          return true;
        }
        return false;
      });

      if (isCategoryExist) {
        toast.error("Category should be unique");
        return;
      }

      await adminAxiosInstance.put(
        `/category/${updatedCategory._id}`,
        updatedCategory
      );
      fetchCategory();
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error updating category.");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await adminAxiosInstance.patch("/category", { categoryId: id });
      fetchCategory();
      toast.success("Status updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update category status.");
    }
  };

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategory = categories.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="flex">
        <Sidebar activePage="Categories" />

        <main className="flex-1 p-6 ">
          <div className="mb-12 ">
            <div className="flex justify-between items-center mb-6 ">
              <h1 className="text-2xl font-semibold">CATEGORIES</h1>
              <button
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Category
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-800">
                      <th className="text-left py-3 px-4">CATEGORY</th>
                      <th className="py-3 px-4 text-center">ICON</th>
                      <th className="py-3 px-4">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <tr
                          key={category._id}
                          className="border-b border-gray-800"
                        >
                          <td className="py-3 px-4">{category.title}</td>
                          <td className="py-3 px-4 text-center">
                            {category.icon}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                className={`px-4 py-1 rounded-md text-sm font-medium ${
                                  category.isBlocked
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-red-500 hover:bg-red-600"
                                }`}
                                onClick={() => toggleStatus(category._id)}
                              >
                                {category.isBlocked ? "List" : "Unlist"}
                              </button>
                              <button
                                className="p-1 hover:bg-gray-800 rounded"
                                onClick={() => {
                                  setSelectedCategory(category);
                                  setIsEditCategoryModalOpen(true);
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
                          No categories available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={categories.length}
            />
          </div>
        </main>
      </div>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSubmit={handleAddCategory}
      />

      <EditCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => setIsEditCategoryModalOpen(false)}
        category={selectedCategory}
        onUpdate={handleEditCategory}
      />
    </div>
  );
}
