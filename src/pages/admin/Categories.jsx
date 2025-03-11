import React, { useCallback, useMemo } from "react";
import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import AddCategoryModal from "../../components/admin/categoryModal/AddCategoryModal";
import EditCategoryModal from "../../components/admin/categoryModal/EditCategoryModal";
import toast from "react-hot-toast";
import { adminAxiosInstance } from "../../utils/axios";
import Table from "../../components/ui/admin/Table";
import ConfirmModal from "../../components/admin/ConfirmModal";
import { debounce } from "lodash";

export default function Categories() {
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCategories, setTotalCategories] = useState(0);
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Confirmation modal state for toggling status
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
  });

  const searchCategories = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await adminAxiosInstance.get("/category/search", {
        params: { query: query.trim() },
      });
      setSearchResults(response.data.data);
    } catch (error) {
      toast.error("Failed to search Categories");
      console.error("Search Error : ", error);
    }
  },[]);

  // Add debounced search
  const debouncedSearch = useMemo(
    () => debounce(searchCategories, 500),
    [searchCategories]
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

  const fetchCategory = async () => {
    try {
      const response = await adminAxiosInstance.get("/category", {
        params: { page: currentPage, limit: itemsPerPage },
      });
      setCategories(response.data.categories || []);
      setTotalCategories(response.data.totalCategories);
    } catch (err) {
      console.error("Error fetching categories", err);
      toast.error("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const getCategories = async () => {
    if (searchResults.length > 0) return;
    setLoading(true);
    await fetchCategory();
  };

  getCategories();
}, [currentPage, searchResults.length]);


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

      const response = await adminAxiosInstance.post("/category", formData);

      if (response.data.success) {
        const newCategory = response.data.category;
        setCategories((prevCategories) => [newCategory, ...prevCategories]);
        setTotalCategories((prevTotal) => prevTotal + 1);
        toast.success("Category added successfully!");
        setIsAddCategoryModalOpen(false);
      } else {
        toast.error(response.data.message || "Error adding category.");
      }
    } catch (err) {
      console.error("Error adding  new category", err);
      toast.error(err.response?.data?.message || "Error adding category.");
    }
  };

  const handleEditCategory = async (updatedCategory) => {
    try {
      const isCategoryExist = categories.some(
        (category) =>
          category.title.toLowerCase() ===
            updatedCategory.title.toLowerCase() &&
          category._id !== updatedCategory._id
      );

      if (isCategoryExist) {
        toast.error("Category should be unique");
        return;
      }

      const response = await adminAxiosInstance.put(
        `/category/${updatedCategory._id}`,
        updatedCategory
      );

      if (response.data.success) {
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category._id === updatedCategory._id ? updatedCategory : category
          )
        );
        toast.success("Category updated successfully!");
        setIsEditCategoryModalOpen(false);
      } else {
        toast.error(response.data.message || "Error updating category.");
      }
    } catch (err) {
      console.error("Error updating category : ", err);
      toast.error(err.response?.data?.message || "Error updating category.");
    }
  };

  // Original toggleStatus for categories
  const toggleStatus = async (id) => {
    try {
      const response = await adminAxiosInstance.patch("/category", {
        categoryId: id,
      });

      if (response.data.success) {
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category._id === id
              ? { ...category, isBlocked: !category.isBlocked }
              : category
          )
        );
        toast.success("Status updated successfully!");
      } else {
        toast.error(
          response.data.message || "Failed to update category status."
        );
      }
    } catch (err) {
      console.error("Error updating category status : ", err);
      toast.error("Failed to update category status.");
    }
  };

  // Wrap toggleStatus with confirmation
  const handleToggleStatus = (category) => {
    setConfirmModal({
      isOpen: true,
      title: category.isBlocked ? "List Category" : "Unlist Category",
      message: `Are you sure you want to ${
        category.isBlocked ? "list" : "unlist"
      } the category "${category.title}"?`,
      onConfirm: async () => {
        await toggleStatus(category._id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const tableHeaders = [
    { key: "category", label: "CATEGORY" },
    { key: "icon", label: "ICON" },
    { key: "action", label: "ACTION" },
  ];

  const renderUserRow = (category) => (
    <tr key={category._id} className="border-b border-gray-800">
      <td className="py-3 px-4">{category.title}</td>
      <td className="py-3 px-4 ">{category.icon}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button
            className={`px-4 py-1 rounded-md text-sm font-medium ${
              category.isBlocked
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
            onClick={() => handleToggleStatus(category)}
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
  );

  return (
    <div className="min-h-screen w-screen overflow-x-auto bg-black text-white">
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="flex flex-row">
        <div className="sm:block">
          <Sidebar activePage="Categories" isCollapsed={isCollapsed} />
        </div>
        <main className="flex-1 p-4 sm:p-6">
          <div className="sm:flex-row justify-between mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">CATEGORIES</h1>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="p-2 rounded bg-gray-800 text-white outline-none w-64"
              />
              <button
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Category</span>
              </button>
            </div>
          </div>
          {/* Wrap table in an overflow container */}
          <div className="w-full overflow-x-auto">
            {!loading && totalCategories === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No categories till now
              </div>
            ) : (
              <Table
                headers={tableHeaders}
                rows={searchQuery ? searchResults : categories}
                loading={loading}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={
                  searchResults.length > 0
                    ? searchResults.length
                    : totalCategories
                }
                onPageChange={setCurrentPage}
                renderRow={(category) => renderUserRow(category)}
              />
            )}
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
