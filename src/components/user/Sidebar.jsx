import React from "react";
import { Link, useLocation } from "react-router-dom"; // Import Link and useLocation from react-router-dom
import { User, MapPin, ShoppingCart, Wallet } from "lucide-react";

export default function Sidebar() {
  const location = useLocation(); // Hook to get the current location

  const links = [
    { to: "/profile", label: "Profile Information", icon: <User className="h-4 w-4" /> },
    { to: "/address", label: "Manage Address", icon: <MapPin className="h-4 w-4" /> },
    { to: "/orders", label: "MY ORDERS", icon: <ShoppingCart className="h-4 w-4" /> },
    { to: "/wallet", label: "MY WALLET", icon: <Wallet className="h-4 w-4" /> },
  ];

  return (
    <aside className="w-64 border-r bg-gray-50/40">
      <nav className="p-4 space-y-2">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Account Settings</h2>
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  location.pathname === link.to
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
