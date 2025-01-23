import React, { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import Modal from "../../components/admin/Modal";
import AddNewProduct from "../../components/admin/productModal/AddNewProduct";
import EditProduct from "../../components/admin/productModal/EditProduct";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import { adminAxiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";

export default function ProductPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const fetchProduct = async () => {
    try {
      const response = await adminAxiosInstance.get("/products");
      setProducts(response.data.products || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products.");
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await adminAxiosInstance.get("/category");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories.");
    }
  };
  const fetchBrands = async () => {
    try {
      const response = await adminAxiosInstance.get("/brands");
      setBrands(response.data.brands || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories.");
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchCategory();
    fetchBrands();
  }, []);

  const handleAddProduct = async (formData) => {
    try {
      const isProductExist = products.some(
        (product) => product.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (isProductExist) {
        toast.error("Product must be unique");
        return;
      }

      await adminAxiosInstance.post("/products", formData);
      toast.success("Product added successfully!");
      fetchProduct();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error adding category.");
    }
  };

  const handleEditProduct = async (formData) => {
    console.log(formData)
    try {
      const isProductExist = products.some(
        (product) => product.name.toLowerCase() === formData.name.toLowerCase()
      );

      if (isProductExist) {
        toast.error("Product must be unique");
        return;
      }

      await adminAxiosInstance.put(`/products/${formData.id}`, formData);
      toast.success("Product updated successfully!");
      fetchProduct();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error updating category.");
    }
  };

  const handleAction = async (productId) => {
    await adminAxiosInstance.patch("/products", { productId });
    fetchProduct();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex">
        <Sidebar activePage="Products" />
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-600"
            >
              <PlusCircle className="h-5 w-5" />
              Add New Product
            </button>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">
                      PRODUCTS
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">
                      CATEGORY
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">
                      Brand
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">
                      PRICE
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">
                      STOCK
                    </th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-gray-800">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <span className="text-sm font-medium text-white">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {product.category?.title || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {product.brand?.title || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {product.price}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsEditModalOpen(true);
                            }}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            className={`px-4 py-1 rounded-md text-sm font-medium uppercase
                          ${
                            !product.isBlocked
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                            onClick={() => handleAction(product._id)}
                          >
                            {product.isBlocked ? "Unblock" : "block"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title="Add New Product"
          >
            <AddNewProduct
              onClose={() => setIsAddModalOpen(false)}
              categories={categories}
              brands={brands}
              onSubmit={handleAddProduct}
            />
          </Modal>

          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Edit Product"
          >
            <EditProduct
              onClose={() => setIsEditModalOpen(false)} // Ensure this updates the state
              products={selectedProduct}
              onUpdate={handleEditProduct}
              brands={brands}
              categories={categories}
            />
          </Modal>
        </main>
      </div>
    </div>
  );
}
