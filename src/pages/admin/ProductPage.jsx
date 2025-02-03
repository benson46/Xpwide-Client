import React, { useState, useEffect } from "react"
import { PlusCircle, Pencil, Star } from "lucide-react"
import Modal from "../../components/Modal"
import AddNewProduct from "../../components/admin/productModal/AddNewProduct"
import EditProduct from "../../components/admin/productModal/EditProduct"
import Sidebar from "../../components/admin/Sidebar"
import Navbar from "../../components/admin/Navbar"
import { adminAxiosInstance } from "../../utils/axios"
import toast from "react-hot-toast"
import Pagination from "../../components/Pagination"

export default function ProductPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchProduct = async () => {
    try {
      const response = await adminAxiosInstance.get("/products", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
        },
      })
      // Sort products to show featured items first
      const sortedProducts = (response.data.products || []).sort((a, b) => {
        if (a.isFeatured === b.isFeatured) return 0
        return a.isFeatured ? -1 : 1
      })
      setProducts(sortedProducts)
      setLoading(false)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch products.")
      setLoading(false)
    }
  }

  const fetchCategory = async () => {
    try {
      const response = await adminAxiosInstance.get("/category")
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch categories.")
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await adminAxiosInstance.get("/brands")
      setBrands(response.data.brands || [])
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch categories.")
    }
  }

  useEffect(() => {
    fetchProduct()
    fetchCategory()
    fetchBrands()
  }, [currentPage])

  const handleAddProduct = async (formData) => {
    try {
      const isProductExist = products.some((product) => product.name.toLowerCase() === formData.name.toLowerCase())

      if (isProductExist) {
        toast.error("Product must be unique")
        return
      }

      await adminAxiosInstance.post("/products", formData)
      toast.success("Product added successfully!")
      fetchProduct()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Error adding category.")
    }
  }

  const handleEditProduct = async (formData) => {
    try {
      const productNamesSet = new Set(products.map(product => product.name.toLowerCase()))
  
      if (productNamesSet.has(formData.name.toLowerCase()) && products.some((product, index) => product.name.toLowerCase() === formData.name.toLowerCase() && index !== formData.index)) {
        toast.error("Product must be unique")
        return
      }
  
      await adminAxiosInstance.put(`/products/${formData.id}`, formData)
      fetchProduct()
      toast.success("Product updated successfully!")
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Error updating product.")
    }
  };

  const handleFeatureToggle = async (productId) => {
    try {
      await adminAxiosInstance.patch("/products/feature", { productId })
      toast.success("Product feature status updated successfully!")
      fetchProduct()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update product feature status.")
    }
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

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
            {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
              <table className="w-full">
                
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">PRODUCTS</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">CATEGORY</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">Brand</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">PRICE</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">STOCK</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">FEATURED</th>
                    <th className="px-6 py-4 text-sm font-medium text-gray-400">ACTION</th>
                  </tr>
                </thead>
                
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-gray-800">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <span className="text-sm font-medium text-white">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{product.category?.title || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{product.brand?.title || "N/A"}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{product.price}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{product.stock}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleFeatureToggle(product._id)}
                          className="group rounded-lg p-2 hover:bg-gray-800"
                        >
                          <Star
                            className={`h-5 w-5 transition-colors ${
                              product.isFeatured
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-gray-400 group-hover:text-white"
                            }`}
                          />
                          <span className="sr-only">
                            {product.isFeatured ? "Remove from featured" : "Add to featured"}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsEditModalOpen(true)
                            }}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            className={`px-4 py-1 rounded-md text-sm font-medium uppercase
                              ${
                                !product.isBlocked ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
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
              )}
            </div>
          </div>
            <Pagination
              totalItems={products.length} 
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />

          <Modal isOpen={isAddModalOpen} setIsOpen={setIsAddModalOpen}>
            <AddNewProduct
              categories={categories}
              brands={brands}
              handleAddProduct={handleAddProduct}
              setIsAddModalOpen={setIsAddModalOpen}
            />
          </Modal>

          <Modal isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen}>
            <EditProduct
              product={selectedProduct}
              categories={categories}
              brands={brands}
              handleEditProduct={handleEditProduct}
              setIsEditModalOpen={setIsEditModalOpen}
            />
          </Modal>
        </main>
      </div>
    </div>
  )
}
