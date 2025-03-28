import React, { useState, useEffect, Suspense, lazy } from "react";
import { PlusCircle, Eye, EyeOff, Trash2, Edit } from "lucide-react";
import Modal from "../../components/Modal";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import { adminAxiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";
import Table from "../../components/ui/admin/Table";
import ConfirmModal from "../../components/admin/ConfirmModal";

const AddBannerModal = lazy(() =>
  import("../../components/admin/banners/AddBannerModel")
);
const EditBannerModal = lazy(() =>
  import("../../components/admin/banners/EditBannerModel")
);

export default function BannerPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBanners, setTotalBanners] = useState(0);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchBanners = async () => {
    try {
      const res = await adminAxiosInstance.get("/banners", {
        params: { page: currentPage, limit: 10 },
      });
      setBanners(res.data.banners);
      setTotalBanners(res.data.total);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch banners");
      console.log("Error fetching banner : ", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [currentPage]);

  const handleAddBanner = (newBanner) => {
    console.log(newBanner);
    setBanners((prev) => [...prev, newBanner]);
    setTotalBanners((prev) => prev + 1);
    setIsAddModalOpen(false);
    toast.success("Banner added!");
  };

  const handleUpdateBanner = (updatedBanner) => {
    setBanners((prev) =>
      prev.map((b) => (b._id === updatedBanner._id ? updatedBanner : b))
    );
    setIsEditModalOpen(false);
    toast.success("Banner updated!");
  };

  const handleDelete = async (id) => {
    try {
      await adminAxiosInstance.delete(`/banners/${id}`);
      setBanners((prev) => prev.filter((b) => b._id !== id));
      toast.success("Banner deleted!");
    } catch (err) {
      toast.error("Delete failed");
      console.log("Error deleting banner : ", err);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await adminAxiosInstance.patch(`/banners/toggle/${id}`);
      setBanners((prev) =>
        prev.map((b) => (b._id === id ? { ...b, isActive: !b.isActive } : b))
      );
    } catch (err) {
      toast.error("Status update failed");
      console.log("Error toggle status banner : ", err);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const renderBannerRow = (banner) => (
    <tr key={banner._id} className="border-b border-gray-800">
      <td className="py-4">
        <img
          src={banner.image}
          alt={banner.title}
          className="h-16 w-32 object-cover rounded"
        />
      </td>
      <td>{banner.title}</td>
      <td>
        <a href={banner.link} className="text-yellow-500 hover:underline">
          {banner.link}
        </a>
      </td>
      <td>
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            banner.isActive
              ? "bg-green-500/20 text-green-500"
              : "bg-red-500/20 text-red-500"
          }`}
        >
          {banner.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="flex gap-3 py-4">
        <button
          onClick={() => toggleStatus(banner._id)}
          className="p-2 hover:bg-gray-800 rounded"
        >
          {banner.isActive ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        <button
          onClick={() => {
            setSelectedBanner(banner);
            setIsEditModalOpen(true);
          }}
          className="p-2 hover:bg-gray-800 rounded"
        >
          <Edit size={20} />
        </button>
        <button
          onClick={() =>
            setConfirmModal({
              isOpen: true,
              title: "Delete Banner",
              message: "Are you sure?",
              onConfirm: () => {
                handleDelete(banner._id);
                setConfirmModal((prev) => ({
                  ...prev,
                  isOpen: false,
                }));
              },
              onCancel: () =>
                setConfirmModal((prev) => ({
                  ...prev,
                  isOpen: false,
                })),
            })
          }
          className="p-2 text-red-500 hover:bg-gray-800 rounded"
        >
          <Trash2 size={20} />
        </button>
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
              <Sidebar activePage="Banners" isCollapsed={isCollapsed} />
            </div>
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Banner Management</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <PlusCircle size={20} /> Add New Banner
            </button>
          </div>
          {!loading && totalBanners === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No banners till now
            </div>
          ) : (
            <Table
              headers={["Image", "Title", "Link", "Status", "Actions"]}
              rows={banners}
              loading={loading}
              currentPage={currentPage}
              itemsPerPage={10}
              totalItems={totalBanners}
              onPageChange={setCurrentPage}
              renderRow={(banner) => renderBannerRow(banner)}
            />
          )}

          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <AddBannerModal
                onSubmit={handleAddBanner}
                onClose={() => setIsAddModalOpen(false)}
              />
            </Suspense>
          </Modal>

          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          >
            <Suspense fallback={<div>Loading...</div>}>
              <EditBannerModal
                banner={selectedBanner}
                onSubmit={handleUpdateBanner}
                onClose={() => setIsEditModalOpen(false)}
              />
            </Suspense>
          </Modal>

          <ConfirmModal
            {...confirmModal}
            onCancel={() =>
              setConfirmModal((prev) => ({ ...prev, isOpen: false }))
            }
          />
        </main>
      </div>
    </div>
  );
}
