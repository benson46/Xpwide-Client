import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import Pagination from "../../components/Pagination";
import { adminAxiosInstance } from "../../utils/axios";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [users, setUsers] = useState([]);
  const fetchUSerList = async () => {
    const response = await adminAxiosInstance.get("/users-list", {
      params: {
        page: currentPage,
        limit: itemsPerPage,
      },
    });
    setUsers(response.data.users);
  };

  useEffect(() => {
    fetchUSerList();
  }, []);

  const handleAction = async (userId) => {
    const response = await adminAxiosInstance.patch("/users-list", { userId });
    fetchUSerList();
  };

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="flex">
        <Sidebar activePage="Users" />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">USERS</h1>
            <div className="relative">
              {/* <button
                className="flex items-center gap-2 px-4 py-2 border border-yellow-500 rounded-md"
                onClick={() => {
                   Add sort functionality 
                }}
              >
                Sort By
                <ChevronDown className="h-4 w-4" />
              </button> */}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-lg bg-gray-900">
            <table className="w-full ">
              <thead>
                <tr className="text-left border-b border-gray-800">
                  <th className="py-3 px-4">USERS</th>
                  <th className="py-3 px-4">MOBILE</th>
                  <th className="py-3 px-4">EMAIL</th>
                  <th className="py-3 px-4">JOINED ON</th>
                  <th className="py-3 px-4">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user._id} className="border-b  border-gray-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{user.mobile}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.createdAt}</td>
                    <td className="py-3 px-4">
                      <button
                        className={`px-4 py-1 rounded-md text-sm font-medium uppercase
                          ${
                            !user.isBlocked
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        onClick={() => handleAction(user._id)}
                      >
                        {user.isBlocked ? "Unblock" : "block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={users.length}
          />
        </main>
      </div>
    </div>
  );
}
