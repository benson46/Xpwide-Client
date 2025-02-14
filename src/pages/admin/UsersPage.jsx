import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import { adminAxiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";
import Table from "../../components/ui/admin/Table";
import ConfirmModal from "../../components/admin/ConfirmModal";
import SearchComponent from "../../components/admin/search/Search";

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [users, setUsers] = useState([]); // For paginated data
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: () =>
      setConfirmModal((prev) => ({ ...prev, isOpen: false })),
  });

  const tableHeaders = [
    { key: "user", label: "USERS" },
    { key: "mobile", label: "MOBILE" },
    { key: "email", label: "EMAIL" },
    { key: "joined", label: "JOINED ON" },
    { key: "action", label: "ACTION" },
  ];

  const renderUserRow = (user) => (
    <tr key={user._id} className="border-b border-gray-800">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar || "/placeholder.svg"}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="whitespace-nowrap">{user.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 whitespace-nowrap">{user.phoneNumber}</td>
      <td className="py-3 px-4 whitespace-nowrap">{user.email}</td>
      <td className="py-3 px-4 whitespace-nowrap">{user.createdAt}</td>
      <td className="py-3 px-4 whitespace-nowrap">
        <button
          className={`px-4 py-1 rounded-md text-sm font-medium uppercase
            ${!user.isBlocked ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
          onClick={() => handleUserAction(user._id, user.isBlocked)}
        >
          {user.isBlocked ? "Unblock" : "Block"}
        </button>
      </td>
    </tr>
  );

  // Fetch paginated users when no search is active
  useEffect(() => {
    if (searchResults !== null) return; // Skip if search is active

    const fetchUserList = async () => {
      setLoading(true);
      try {
        const response = await adminAxiosInstance.get("/users-list", {
          params: { page: currentPage, limit: itemsPerPage },
        });
        setUsers(response.data.users);
      } catch (error) {
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUserList();
  }, [currentPage, searchResults]);

  const handleUserAction = (userId, isBlocked) => {
    setConfirmModal({
      isOpen: true,
      title: isBlocked ? "Unblock User" : "Block User",
      message: `Are you sure you want to ${isBlocked ? "unblock" : "block"} this user?`,
      onConfirm: async () => {
        try {
          const res = await adminAxiosInstance.patch("/users-list", { userId });
          if (res.data.success) {
            // Update user status in the appropriate state
            if (searchResults) {
              setSearchResults((prev) =>
                prev.map((user) =>
                  user._id === userId ? { ...user, isBlocked: !isBlocked } : user
                )
              );
            } else {
              setUsers((prevUsers) =>
                prevUsers.map((user) =>
                  user._id === userId ? { ...user, isBlocked: !isBlocked } : user
                )
              );
            }
            toast.success(res.data.message || "User status updated successfully");
          } else {
            toast.error(res.data.message || "Failed to update user status");
          }
        } catch (error) {
          toast.error("An error occurred while updating user status");
          console.error("Error updating user status:", error);
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () =>
        setConfirmModal((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // Callback for the SearchComponent.
  // If results is null, it means the search input was cleared.
  const handleSearchFilter = (results) => {
    setSearchResults(results);
  };

  // Decide which data to display: search results (if active) or paginated users
  const dataToDisplay = searchResults !== null ? searchResults : users;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex h-[calc(100vh-73px)]">
        <div className="sm:block">
          <Sidebar activePage="Users" isCollapsed={isCollapsed} />
        </div>
        <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">USERS</h1>
            {/* Reusable search component */}
            <SearchComponent
              entity="users"
              placeholder="Search by email..."
              onFilter={handleSearchFilter}
            />
          </div>
          <Table
            headers={tableHeaders}
            rows={dataToDisplay}
            loading={loading}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={dataToDisplay.length} // Update this if you have a total count from your API
            onPageChange={handlePageChange}
            renderRow={(user) => renderUserRow(user)}
          />
        </main>
      </div>
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
