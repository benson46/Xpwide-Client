"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Pencil, Star } from "lucide-react"
import Modal from "../../components/Modal"
import AddNewProduct from "../../components/admin/productModal/AddNewProduct"
import Sidebar from "../../components/admin/Sidebar"
import Navbar from "../../components/admin/Navbar"
import { adminAxiosInstance } from "../../utils/axios"
import toast from "react-hot-toast"
import EditProductModal from "../../components/admin/productModal/EditProduct"
import Table from "../../components/ui/admin/Table"
import ConfirmModal from "../../components/admin/ConfirmModal"

export default function ProductPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalProducts, setTotalProducts] = useState(0)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [])

  const toggleSidebar = () => setIsCollapsed((prev) => !prev)

  const fetchProducts = async () => {
    try {
      const res = await adminAxiosInstance.get("/products", {
        params: { page: currentPage, limit: itemsPerPage },
      })
      setProducts(res.data.products)
      setTotalProducts(res.data.totalProducts)
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
    setLoading(true)
    fetchProducts()
  }

  const handleAddProduct = async (newProduct) => {
    try {
      await adminAxiosInstance.post("/products", newProduct)
      toast.success("Product added successfully!")
      setIsAddModalOpen(false)
      fetchProducts()
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
      fetchProducts()
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Failed to update product")
    }
  }

  const handleFeatureToggle = async (productId) => {
    try {
      const res = await adminAxiosInstance.put(`/products/${productId}`, {
        isFeatured: !products.find((p) => p._id === productId).isFeatured,
      })
      if (res.data.success) {
        const productIndex = products.findIndex((p) => p._id === productId)
        const updatedProduct = {
          ...products[productIndex],
          isFeatured: !products[productIndex].isFeatured,
        }
        const updatedProducts = [...products]
        updatedProducts[productIndex] = updatedProduct
        setProducts(updatedProducts)
        toast.success(res.data.message || "Featured status updated successfully!")
      } else {
        toast.error(res.data.message || "Failed to update featured status")
      }
    } catch (error) {
      console.error("Error updating featured status:", error)
      toast.error("An error occurred while updating featured status")
    }
  }

  const handleActionConfirm = (productId, currentStatus) => {
    const newStatus = !currentStatus
    setConfirmModal({
      isOpen: true,
      title: newStatus ? "Confirm Block" : "Confirm Unblock",
      message: `Are you sure you want to ${newStatus ? "block" : "unblock"} this product?`,
      onConfirm: async () => {
        try {
          const res = await adminAxiosInstance.patch(`/products/${productId}`, {
            isBlocked: newStatus,
          })
          if (res.data.success) {
            const productIndex = products.findIndex((p) => p._id === productId)
            const updatedProduct = {
              ...products[productIndex],
              isBlocked: newStatus,
            }
            const updatedProducts = [...products]
            updatedProducts[productIndex] = updatedProduct
            setProducts(updatedProducts)
            toast.success(res.data.message || "Product status updated successfully!")
          } else {
            toast.error(res.data.message || "Failed to update product status")
          }
        } catch (error) {
          toast.error("An error occurred while updating product status")
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }))
      },
      onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
    })
  }

  const tableHeaders = [
    { key: "product", label: "PRODUCT" },
    { key: "category", label: "CATEGORY" },
    { key: "brand", label: "BRAND" },
    { key: "price", label: "PRICE" },
    { key: "stock", label: "STOCK" },
    { key: "featured", label: "FEATURED" },
    { key: "action", label: "ACTION" },
  ]

  const renderUserRow = (product) => (
    <tr key={product._id} className="border-b border-gray-800">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            className="h-10 w-10 rounded-lg object-cover"
          />
          <span className="text-sm font-medium text-white whitespace-nowrap">{product.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">{product.category?.title || "N/A"}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">{product.brand?.title || "N/A"}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">{product.price}</td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">{product.stock}</td>
      <td className="px-6 py-4">
        <button onClick={() => handleFeatureToggle(product._id)} className="group rounded-lg p-2 hover:bg-gray-800">
          <Star
            className={`h-5 w-5 transition-colors ${
              product.isFeatured ? "fill-yellow-500 text-yellow-500" : "text-gray-400 group-hover:text-white"
            }`}
          />
          <span className="sr-only">{product.isFeatured ? "Remove from featured" : "Add to featured"}</span>
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
            className={`px-4 py-1 rounded-md text-sm font-medium uppercase ${
              !product.isBlocked ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
            onClick={() => handleActionConfirm(product._id, product.isBlocked)}
          >
            {product.isBlocked ? "Unblock" : "Block"}
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex h-[calc(100vh-73px)]">
        <div className="sm:block">
          <Sidebar activePage="Products" isCollapsed={isCollapsed} />
        </div>
        <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">PRODUCTS</h1>
          </div>
          <div className="mb-6">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-600 transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              Add New Product
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <Table
              headers={tableHeaders}
              rows={products}
              loading={loading}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalProducts}
              onPageChange={handlePageChange}
              renderRow={(product) => renderUserRow(product)}
            />
          </div>
        </main>
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
          <EditProductModal
            product={selectedProduct}
            categories={categories}
            brands={brands}
            onUpdate={handleEditProduct}
            setIsEditModalOpen={setIsEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
        </div>
      </Modal>
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
  )
}

