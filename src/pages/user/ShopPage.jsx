"use client"

import { useState } from "react"
import CategorySidebar from "../../components/user/CategorySidebar"
import { ChevronDown } from "lucide-react"
import Pagination from "../../components/Pagination"

export default function ShopPage() {
  const [sortBy, setSortBy] = useState("featured")

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "popularity", label: "Popularity" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Average Rating" },
    { value: "newest", label: "New Arrivals" },
    { value: "a-z", label: "Name: A to Z" },
    { value: "z-a", label: "Name: Z to A" },
  ]

  const products = Array(6).fill({
    title: "Red Redemption 2",
    price: "$59.99",
    rating: 5,
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2bi5msvmy1qFIS2CpdknsAyMwIKqkI.png",
    date: "2024-01-15",
  })

  // Function to sort products based on selected option
  const getSortedProducts = () => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return Number.parseFloat(a.price.replace("$", "")) - Number.parseFloat(b.price.replace("$", ""))
        case "price-high":
          return Number.parseFloat(b.price.replace("$", "")) - Number.parseFloat(a.price.replace("$", ""))
        case "rating":
          return b.rating - a.rating
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "a-z":
          return a.title.localeCompare(b.title)
        case "z-a":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })
  }

  return (
    <div className="flex min-h-screen bg-white">
      <CategorySidebar />

      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Products</h1>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getSortedProducts().map((product, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <div className="flex items-center mb-2">
                  {[...Array(product.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                <p className="text-gray-600">{product.price}</p>
              </div>
            </div>
          ))}
        </div>

        <Pagination/>
      </main>
    </div>
  )
}
