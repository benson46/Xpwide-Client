import { useState } from "react"

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("profile")

  const menuItems = [
    {
      title: "Account Settings",
      subItems: [
        { id: "profile", label: "Profile Information" },
        { id: "address", label: "Manage Address" },
      ],
    },
    {
      id: "orders",
      label: "MY ORDERS",
    },
    {
      id: "wallet",
      label: "MY WALLET",
    },
  ]

  return (
    <aside className="w-64 bg-gray-100 min-h-screen p-4">
      <nav className="space-y-4">
        {menuItems.map((item) => (
          <div key={item.title || item.id} className="space-y-2">
            {item.title ? (
              <>
                <h2 className="text-sm font-semibold text-gray-600">{item.title}</h2>
                <div className="space-y-1 pl-2">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveItem(subItem.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                        ${
                          activeItem === subItem.id
                            ? "bg-gray-200 text-gray-900"
                            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <button
                onClick={() => setActiveItem(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors
                  ${
                    activeItem === item.id
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
              >
                {item.id === "orders" && (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                )}
                {item.id === "wallet" && (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                )}
                {item.label}
              </button>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}

