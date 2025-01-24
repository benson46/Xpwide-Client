'use client'

import { useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "SONY PlayStation 5 console",
      category: "Console",
      manufacturer: "Sony",
      price: 59990,
      quantity: 1,
      stock: 0,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ShIkeiVFNU5QcrCy59nENSx5uBnhZq.png"
    },
    {
      id: 2,
      name: "GTA V",
      category: "Game",
      manufacturer: "Rockstar",
      price: 1970,
      quantity: 1,
      stock: 10,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ShIkeiVFNU5QcrCy59nENSx5uBnhZq.png"
    },
    {
      id: 3,
      name: "Red Redemption 2",
      category: "Game",
      manufacturer: "Rockstar",
      price: 2034,
      quantity: 1,
      stock: 5,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ShIkeiVFNU5QcrCy59nENSx5uBnhZq.png"
    }
  ])

  const updateQuantity = (id, change) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change
          if (newQuantity < 1 || newQuantity > item.stock) return item
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">SHOPPING CART</h1>
        <button className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors">
          CONTINUE SHOPPING
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h2 className="font-semibold mb-4">MY CART</h2>
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="w-32 h-32 flex-shrink-0">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-sm text-gray-600">{item.manufacturer}</p>
                    </div>
                    <p className="font-medium">₹{item.price}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1 || item.stock === 0}
                        className="p-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.quantity >= item.stock || item.stock === 0}
                        className="p-1 rounded border hover:bg-gray-100 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={item.stock === 0 ? 'text-red-500' : 'text-green-500'}>
                        {item.stock === 0 ? 'OUT OF STOCK' : 'IN STOCK'}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        REMOVE
                      </button>
                      <button
                        disabled={item.stock === 0}
                        className="px-4 py-1 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors disabled:opacity-50"
                      >
                        BUY NOW
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">SUBTOTAL</span>
              <span className="font-medium">₹{subtotal}</span>
            </div>
            <button className="w-full py-2 bg-black text-white rounded hover:bg-gray-900 transition-colors">
              BUY ALL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
