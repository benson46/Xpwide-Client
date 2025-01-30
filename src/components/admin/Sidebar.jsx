import {
  LayoutGrid,
  ShoppingCart,
  Package,
  Users,
  Grid,
  Ticket,
  ImageIcon,
  Wallet,
  Percent,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const menuItems = [
  { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
  { name: "Orders", icon: ShoppingCart, path: "/order-table" },
  { name: "Products", icon: Package, path: "/products" },
  { name: "Users", icon: Users, path: "/users" },
  { name: "Categories", icon: Grid, path: "/categories" },
  { name: "Brands", icon: Tag, path: "/brands" },
  { name: "Coupons", icon: Ticket, path: "/coupons" },
  { name: "Banners", icon: ImageIcon, path: "/banners" },
  { name: "Payments", icon: Wallet, path: "/payments" },
  { name: "Offers", icon: Percent, path: "/offers" },
];

export default function Sidebar({ activePage }) {
  const navigate = useNavigate();
  const handleClick = (path) => {
    const link = name.toLowerCase();
    navigate(`/admin${path}`);
  };
  return (
    <aside className="w-64 min-h-[calc(100vh-73px)] bg-black border-r border-gray-800">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <button
                  onClick={() => handleClick(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors
                    ${
                      activePage === item.name
                        ? "bg-yellow-500 text-black"
                        : "text-white hover:bg-gray-900"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
