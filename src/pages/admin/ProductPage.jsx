import React, {
  useState,
  useEffect,
  Suspense,
  lazy,
  useMemo,
  useCallback,
} from "react";
import { PlusCircle, Pencil, Star } from "lucide-react";
import { debounce } from "lodash";
import Modal from "../../components/Modal";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import { adminAxiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";
import Table from "../../components/ui/admin/Table";
import ConfirmModal from "../../components/admin/ConfirmModal";

const AddNewProduct = lazy(() =>
  import("../../components/admin/productModal/AddNewProduct")
);
const EditProductModal = lazy(() =>
  import("../../components/admin/productModal/EditProduct")
);

export default function ProductPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
  });

  const searchProducts = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await adminAxiosInstance.get("/products/search", {
        params: { query: query.trim() },
      });
      setSearchResults(response.data.data);
    } catch (error) {
      toast.error("Failed to search products");
      console.error("Search error:", error);
    }
  }, []);

  // Add debounced search
  const debouncedSearch = useMemo(
    () => debounce(searchProducts, 500),
    [searchProducts]
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

  const fetchProducts = async () => {
    try {
      const res = await adminAxiosInstance.get("/products", {
        params: { page: currentPage, limit: itemsPerPage },
      });
      setProducts(res.data.products);
      setTotalProducts(res.data.totalProducts);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.log("Error on fetching products : ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchResults.length > 0) return;
    setLoading(true);
    fetchProducts();
  }, [currentPage, searchResults.length]);

  const fetchCategoriesAndBrands = async () => {
    try {
      if (categories.length === 0) {
        const categoriesRes = await adminAxiosInstance.get("/category");
        setCategories(categoriesRes.data.categories);
      }
      if (brands.length === 0) {
        const brandsRes = await adminAxiosInstance.get("/brands");
        setBrands(brandsRes.data.brands);
      }
    } catch (error) {
      toast.error("Failed to load required data");
      console.log("Error fetching category or brand : ", error);
    }
  };

  const handleAddProduct = async (newProduct) => {
    try {
      const res = await adminAxiosInstance.post("/products", newProduct);
      if (res.data.success) {
        setProducts((prev) => [...prev, res.data.product]);
        setTotalProducts((prevTotal) => prevTotal + 1);
        toast.success("Product added successfully!");
        setIsAddModalOpen(false);
      } else {
        toast.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  const handleEditProduct = async (updatedProduct) => {
    try {
      const res = await adminAxiosInstance.put(
        "/products/edit-product",
        updatedProduct
      );

      if (res.data.success) {
        setProducts((prev) =>
          prev.map((product) =>
            product._id === updatedProduct.id ? res.data.product : product
          )
        );
        toast.success("Product updated successfully!");
        setIsEditModalOpen(false);
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleFeatureToggle = async (productId) => {
    try {
      const res = await adminAxiosInstance.patch(`/products/feature`, {
        productId,
      });

      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, isFeatured: !p.isFeatured } : p
          )
        );
      }
    } catch (error) {
      toast.error("Error updating featured status");
      console.log("Error updating on feature product : ", error);
    }
  };

  const tableHeaders = useMemo(
    () => [
      { key: "product", label: "PRODUCT" },
      { key: "category", label: "CATEGORY" },
      { key: "brand", label: "BRAND" },
      { key: "price", label: "PRICE" },
      { key: "stock", label: "STOCK" },
      { key: "featured", label: "FEATURED" },
      { key: "action", label: "ACTION" },
    ],
    []
  );

  const handleModalOpen = async (product = null) => {
    await fetchCategoriesAndBrands();
    product ? setSelectedProduct(product) : setSelectedProduct(null);
    product ? setIsEditModalOpen(true) : setIsAddModalOpen(true);
  };

  const Loader = () => (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar toggleSidebar={() => setIsCollapsed((prev) => !prev)} />
      <div className="flex h-[calc(100vh-73px)]">
        <Sidebar activePage="Products" isCollapsed={isCollapsed} />

        <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">PRODUCTS</h1>
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="p-2 rounded bg-gray-800 text-white outline-none w-64"
              />
              <button
                onClick={() => handleModalOpen()}
                className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-600 transition-colors"
              >
                <PlusCircle className="h-5 w-5" />
                Add New Product
              </button>
            </div>
          </div>

          {!loading && totalProducts === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No Products till now
            </div>
          ) : (
            <Table
              headers={tableHeaders}
              rows={searchResults.length > 0 ? searchResults : products}
              loading={loading}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={
                searchResults.length > 0 ? searchResults.length : totalProducts
              }
              onPageChange={setCurrentPage}
              renderRow={(product) => (
                <tr key={product._id} className="border-b border-gray-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <span className="text-sm font-medium text-white whitespace-nowrap">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {product.category?.title || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {product.brand?.title || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {product.price}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleFeatureToggle(product._id)}
                      className="group rounded-lg p-2 hover:bg-gray-800"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          product.isFeatured
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleModalOpen(product)}
                        className="p-2 text-gray-400 hover:bg-gray-800 rounded-lg"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        className={`px-4 py-1 rounded-md text-sm font-medium uppercase ${
                          !product.isBlocked ? "bg-red-500" : "bg-green-500"
                        }`}
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            title: `${
                              product.isBlocked ? "Unblock" : "Block"
                            } Product`,
                            message: `Confirm to ${
                              product.isBlocked ? "unblock" : "block"
                            } this product?`,
                            onConfirm: async () => {
                              try {
                                await adminAxiosInstance.patch(
                                  `/products/${product._id}`,
                                  { isBlocked: !product.isBlocked }
                                );
                                setProducts((prev) =>
                                  prev.map((p) =>
                                    p._id === product._id
                                      ? { ...p, isBlocked: !p.isBlocked }
                                      : p
                                  )
                                );
                              } catch (error) {
                                toast.error("Operation failed");
                                console.log(
                                  "Error on blocking or unblocking product : ",
                                  error
                                );
                              }
                              setConfirmModal((prev) => ({
                                ...prev,
                                isOpen: false,
                              }));
                            },
                          })
                        }
                      >
                        {product.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            />
          )}
        </main>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <Suspense fallback={<Loader />}>
          <AddNewProduct
            categories={categories}
            brands={brands}
            onSubmit={handleAddProduct}
            onClose={() => setIsAddModalOpen(false)}
          />
        </Suspense>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <Suspense fallback={<Loader />}>
          {console.log(selectedProduct)}
          <EditProductModal
            product={selectedProduct}
            categories={categories}
            brands={brands}
            onUpdate={handleEditProduct}
            setIsEditModalOpen={setIsEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
        </Suspense>
      </Modal>

      <ConfirmModal {...confirmModal} />
    </div>
  );
}
