import { useState, useEffect } from "react"
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false) // Added state variable
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  useEffect(() => {
    
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await adminAxiosInstance.get("/products")
      setProducts(res.data.products)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await adminAxiosInstance.get("/category")
      setCategories(res.data.categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to fetch categories")
    }
  }

  const fetchBrands = async () => {
    try {
      const res = await adminAxiosInstance.get("/brands")
      setBrands(res.data.brands)
    } catch (error) {
      console.error("Error fetching brands:", error)
      toast.error("Failed to fetch brands")
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleAddProduct = async (newProduct) => {
    try {
      await adminAxiosInstance.post("/products", newProduct)
      toast.success("Product added successfully!")
      setIsAddModalOpen(false)
      // Refresh products after adding a new one
      const res = await adminAxiosInstance.get("/products")
      setProducts(res.data)
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error("Failed to add product")
    }
  }

  const handleEditProduct = async (updatedProduct) => {
    try {
      await adminAxiosInstance.put(`/products/${updatedProduct._id}`, updatedProduct)
      toast.success("Product updated successfully!")
      setIsEditModalOpen(false)
      // Refresh products after editing one
      const res = await adminAxiosInstance.get("/products")
      setProducts(res.data.products)
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Failed to update product")
    }
  }

  const handleFeatureToggle = async (productId) => {
    try {
      const productIndex = products.findIndex((p) => p._id === productId)
      const updatedProduct = { ...products[productIndex], isFeatured: !products[productIndex].isFeatured }
      await adminAxiosInstance.put(`/products/${productId}`, { isFeatured: updatedProduct.isFeatured })
      const updatedProducts = [...products]
      updatedProducts[productIndex] = updatedProduct
      setProducts(updatedProducts)
      toast.success("Featured status updated successfully!")
    } catch (error) {
      console.error("Error updating featured status:", error)
      toast.error("Failed to update featured status")
    }
  }

  const handleAction = async (productId) => {
    try {
      const productIndex = products.findIndex((p) => p._id === productId)
      const updatedProduct = { ...products[productIndex], isBlocked: !products[productIndex].isBlocked }
      await adminAxiosInstance.put(`/products/${productId}`, { isBlocked: updatedProduct.isBlocked })
      const updatedProducts = [...products]
      updatedProducts[productIndex] = updatedProduct
      setProducts(updatedProducts)
      toast.success("Product status updated successfully!")
    } catch (error) {
      console.error("Error updating product status:", error)
      toast.error("Failed to update product status")
    }
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = products.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="w-full">
        <Navbar />
      </div>

      <div className="flex flex-1">
        <Sidebar activePage="Products" />
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
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
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-[1000px]">
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
                        <th className="px-6 py-4 text-sm font-medium text-gray-400">BRAND</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-400">PRICE</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-400">STOCK</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-400">FEATURED</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-400">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProducts.map((product) => (
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
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Pagination
              totalItems={products.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>

          <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
            <div className="w-full max-w-2xl mx-auto">
              <AddNewProduct
                categories={categories}
                brands={brands}
                handleAddProduct={handleAddProduct}
                onClose={() => setIsAddModalOpen(false)}
              />
            </div>
          </Modal>

          <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
            <div className="w-full max-w-2xl mx-auto">
              <EditProduct
                product={selectedProduct}
                categories={categories}
                brands={brands}
                onUpdate={handleEditProduct}
                setIsEditModalOpen={setIsEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
              />
            </div>
          </Modal>
        </main>
      </div>
    </div>
  )
}

