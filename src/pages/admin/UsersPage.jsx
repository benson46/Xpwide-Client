import React,{ useState, useEffect, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import { adminAxiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";
import Table from "../../components/ui/admin/Table";
import ConfirmModal from "../../components/admin/ConfirmModal";

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 10;

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
  });

  // Search users function
  const searchUsers = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await adminAxiosInstance.get("/users/search", {
        params: { query: query.trim() },
      });
      setSearchResults(response.data.data);
    } catch (error) {
      toast.error("Failed to search users");
      console.error("Search error:", error);
    }
  }, []);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(searchUsers, 500),
    [searchUsers]
  );

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    if (searchResults.length > 0) return;

    const fetchUserList = async () => {
      setLoading(true);
      try {
        const response = await adminAxiosInstance.get("/users-list", {
          params: { page: currentPage, limit: itemsPerPage },
        });
        setUsers(response.data.users);
        setTotalUsers(response.data.total);
      } catch (err) {
        toast.error("Failed to fetch users");
        console.log('Error on fetching user list : ',err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserList();
  }, [currentPage, searchResults.length]);

  const handleUserAction = (userId, isBlocked) => {
    setConfirmModal({
      isOpen: true,
      title: isBlocked ? "Unblock User" : "Block User",
      message: `Are you sure you want to ${
        isBlocked ? "unblock" : "block"
      } this user?`,
      onConfirm: async () => {
        try {
          const res = await adminAxiosInstance.patch("/users-list", { userId });
          if (res.data.success) {
            const updatedUser = {
              ...users.find((user) => user._id === userId),
              isBlocked: !isBlocked,
            };

            const updateState = (prev) =>
              prev.map((user) => (user._id === userId ? updatedUser : user));

            searchResults.length > 0
              ? setSearchResults(updateState)
              : setUsers(updateState);

            toast.success(
              res.data.message || "User status updated successfully"
            );
          }
        } catch (err) {
          toast.error("Error updating user status");
          console.log('Error on blocking or unblocking user : ',err)
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const tableHeaders = useMemo(
    () => [
      { key: "user", label: "USERS" },
      { key: "mobile", label: "MOBILE" },
      { key: "email", label: "EMAIL" },
      { key: "joined", label: "JOINED ON" },
      { key: "action", label: "ACTION" },
    ],
    []
  );

  const renderUserRow = (user) => (
    <tr key={user._id} className="border-b border-gray-800">
      <td className="py-3 px-4 whitespace-nowrap">{`${user.firstName} ${user.lastName || ""}`}</td>
      <td className="py-3 px-4 whitespace-nowrap">{user.phoneNumber}</td>
      <td className="py-3 px-4 whitespace-nowrap">{user.email}</td>
      <td className="py-3 px-4 whitespace-nowrap">{user.createdAt}</td>
      <td className="py-3 px-4 whitespace-nowrap">
        <button
          className={`px-4 py-1 rounded-md text-sm font-medium uppercase ${
            !user.isBlocked
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
          onClick={() => handleUserAction(user._id, user.isBlocked)}
        >
          {user.isBlocked ? "Unblock" : "Block"}
        </button>
      </td>
    </tr>
  );


  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex h-[calc(100vh-73px)]">
        <Sidebar activePage="Users" isCollapsed={isCollapsed} />
        <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold">USERS</h1>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email..."
              className="p-2 rounded bg-gray-800 text-white outline-none w-64"
            />
          </div>

          {!loading && totalUsers === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No users till now
            </div>
          ) : (
            <Table
              headers={tableHeaders}
              rows={searchResults.length > 0 ? searchResults : users}
              loading={loading}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={searchResults.length > 0 ? searchResults.length : totalUsers}
              onPageChange={handlePageChange}
              renderRow={renderUserRow}
            />
          )}
        </main>
      </div>

      <ConfirmModal {...confirmModal} />
    </div>
  );
}