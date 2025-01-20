import Sidebar from "../../components/admin/Sidebar"
import Navbar from "../../components/admin/Navbar"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="flex">
        <Sidebar activePage="Dashboard" />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
          {/* Add dashboard content here */}
        </main>
      </div>
    </div>
  )
}
