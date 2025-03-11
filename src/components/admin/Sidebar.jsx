import React,{ memo } from "react";
import PropTypes from "prop-types";
import {
  LayoutGrid,
  ShoppingCart,
  Package,
  Users,
  Grid,
  Ticket,
  ImageIcon,
  Tag,
  Percent,
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
  { name: "Offers", icon: Percent, path: "/offers" },
];

const Sidebar = ({ activePage, isCollapsed }) => {
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(`/admin${path}`);
  };

  return (
    <aside
      className={` sm:w-[${isCollapsed ? "4rem" : "16rem"}] min-h-[calc(100vh-73px)] bg-black border-r border-gray-800 transition-all duration-300 ease-in-out overflow-hidden`}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <button
                  onClick={() => handleClick(item.path)}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-2" : "gap-3 px-4"
                  } py-2 rounded-md transition-colors ${
                    activePage === item.name
                      ? "bg-yellow-500 text-black"
                      : "text-white hover:bg-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  activePage: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
};

export default memo(Sidebar);
