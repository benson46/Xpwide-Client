export default function CategorySidebar() {
  const categories = [
    { id: "all", label: "All Products" },
    { id: "games", label: "Games" },
    { id: "console", label: "Console" },
    { id: "accessories", label: "Accessories" },
  ];

  return (
    <aside className="w-64 p-6 border-r">
      <div className="mb-8">
        <h2 className="font-semibold mb-4">PRODUCT CATEGORIES</h2>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center">
              <input type="checkbox" className="mr-2" id={category.id} />
              <label htmlFor={category.id} className="text-sm text-gray-600">
                {category.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-4">FILTER BY PRICE</h2>
        <input
          type="range"
          min="0"
          max="100"
          defaultValue="0"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />

        <div className="text-sm text-gray-600 mt-2">Price: $0 - $100</div>
      </div>
    </aside>
  );
}
