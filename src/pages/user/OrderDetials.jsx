import React from 'react'
import { useState } from 'react'
import { Download, X } from 'lucide-react'

export default function OrderDetails() {
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  
  // Sample order data
  const order = {
    product: {
      name: "GTA V",
      category: "Game",
      manufacturer: "Rockstar",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bvpVGCMMSUDsttFAD6V2c03qwvEmbx.png",
      quantity: 1,
      price: "₹1970"
    },
    status: {
      current: "delivered",
      timeline: [
        { 
          status: "Order Confirmed", 
          date: "Nov. 15th", 
          time: "10:00 AM",
          completed: true 
        },
        { 
          status: "Shipped", 
          date: "Nov. 17th", 
          time: "2:30 PM",
          completed: true 
        },
        { 
          status: "Out for delivery", 
          date: "Nov. 19th", 
          time: "9:00 AM",
          completed: true 
        },
        { 
          status: "Delivered", 
          date: "Nov. 20th", 
          time: "3:45 PM",
          completed: true 
        }
      ]
    },
    delivery: {
      name: "BENSON B VAROOR",
      address: "Edathuruthikaran Holdings, 10/450-2, Kundannoor, Maradu, Ernakulam, Kerala, Erothayil Near Tea Mank",
      pincode: "682304",
      state: "Kerala",
      phone: "8943390066"
    },
    returnEligible: true,
    returnWindow: "Dec 20th, 2024"
  }

  const returnReasons = [
    "Product damaged or defective",
    "Wrong item received",
    "Item doesn't match description",
    "Changed my mind",
    "Better price available elsewhere",
    "Other"
  ]

  const handleReturn = (e) => {
    e.preventDefault()
    // Handle return logic here
    setShowReturnModal(false)
    // You might want to show a success message or update the order status
  }

  const getStatusColor = (completed) => {
    return completed ? "text-green-600" : "text-gray-400"
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Product Details */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-start gap-4">
          <img
            src={order.product.image || "/placeholder.svg"}
            alt={order.product.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div>
            <h2 className="font-semibold text-lg">{order.product.name}</h2>
            <p className="text-sm text-gray-600">Category: {order.product.category}</p>
            <p className="text-sm text-gray-600">Manufacturer: {order.product.manufacturer}</p>
            <p className="text-sm text-gray-600">Quantity: {order.product.quantity}</p>
            <p className="font-medium mt-1">{order.product.price}</p>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="relative">
          <div className="absolute left-[15px] top-0 h-full w-0.5 bg-gray-200" />
          {order.status.timeline.map((item, index) => (
            <div key={index} className="flex gap-4 mb-8 last:mb-0 relative">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white ${
                item.completed ? 'border-green-600' : 'border-gray-300'
              }`}>
                {item.completed && (
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${getStatusColor(item.completed)}`}>
                  {item.status}
                </p>
                <p className="text-sm text-gray-500">
                  {item.date} - {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Delivery Address */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Delivery Address</h3>
          <div className="space-y-2">
            <p className="font-medium">{order.delivery.name}</p>
            <p className="text-gray-600 text-sm leading-relaxed">
              {order.delivery.address}
            </p>
            <p className="text-gray-600 text-sm">
              {order.delivery.state} - {order.delivery.pincode}
            </p>
            <p className="text-gray-600 text-sm">
              Phone Number : {order.delivery.phone}
            </p>
          </div>
        </div>

        {/* More Actions */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold mb-4">More Actions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm mb-2">Download Invoice</h4>
              <button className="w-full bg-blue-800 text-white rounded py-2 px-4 flex items-center justify-center gap-2 hover:bg-blue-900 transition-colors">
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
            </div>
            
            {order.returnEligible && (
              <div>
                <h4 className="text-sm mb-2">Return Product</h4>
                <p className="text-xs text-gray-500 mb-2">
                  Return window available until {order.returnWindow}
                </p>
                <button 
                  onClick={() => setShowReturnModal(true)}
                  className="w-full bg-red-600 text-white rounded py-2 px-4 hover:bg-red-700 transition-colors"
                >
                  Return Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Return Product</h3>
              <button 
                onClick={() => setShowReturnModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReturn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Return Reason
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a reason</option>
                  {returnReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Comments
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Please provide any additional details about your return..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Submit Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
