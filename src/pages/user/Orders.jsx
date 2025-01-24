"use client"


export default function Orders() {
  const orders = [
    {
      id: 1,
      product: {
        name: "Red Redemption 2",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WFTYUserr0NAldDx9lxBPZvtzSomvK.png",
        category: "Game",
        manufacturer: "Rockstar",
      },
      quantity: 1,
      price: 2034,
      status: "DISPATCHED",
    },
    {
      id: 2,
      product: {
        name: "GTA V",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WFTYUserr0NAldDx9lxBPZvtzSomvK.png",
        category: "Game",
        manufacturer: "Rockstar",
      },
      quantity: 2,
      price: 1970,
      status: "DELIVERED",
      deliveryDate: "16-12-2024",
    },
    {
      id: 3,
      product: {
        name: "SONY PlayStation 5 console",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WFTYUserr0NAldDx9lxBPZvtzSomvK.png",
        category: "Console",
        manufacturer: "Sony",
      },
      quantity: 1,
      price: 59390,
      status: "REFUND COMPLETED",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "DISPATCHED":
        return "text-amber-500"
      case "DELIVERED":
        return "text-green-500"
      case "REFUND COMPLETED":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getActionbuttons = (status) => {
    switch (status) {
      case "DISPATCHED":
        return (
          <div className="space-y-2">
            <button className="w-full bg-amber-500 hover:bg-amber-600">RETURN</button>
            <button className="w-full bg-red-500 hover:bg-red-600">CANCEL ORDER</button>
          </div>
        )
      case "DELIVERED":
      case "REFUND COMPLETED":
        return <button className="w-full bg-blue-800 hover:bg-blue-900">VIEW</button>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">ORDERS</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">MY ORDERS</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-4">PRODUCT</th>
              <th className="text-center py-4 px-4">QUANTITY</th>
              <th className="text-center py-4 px-4">PRICE</th>
              <th className="text-center py-4 px-4">STATUS</th>
              <th className="text-center py-4 px-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="py-4 px-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-24 h-24 relative flex-shrink-0">
                      <img
                        src={order.product.image || "/placeholder.svg"}
                        alt={order.product.name}
                        className="object-cover rounded w-full h-full"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{order.product.name}</h3>
                      <p className="text-sm text-gray-600">{order.product.category}</p>
                      <p className="text-sm text-gray-600">{order.product.manufacturer}</p>
                    </div>
                  </div>
                </td>
                <td className="text-center py-4 px-4">{order.quantity}</td>
                <td className="text-center py-4 px-4">₹{order.price}</td>
                <td className="text-center py-4 px-4">
                  <div className="flex flex-col items-center">
                    <span className={getStatusColor(order.status)}>{order.status}</span>
                    {order.deliveryDate && <span className="text-sm text-green-500 mt-1">{order.deliveryDate}</span>}
                  </div>
                </td>
                <td className="text-center py-4 px-4 min-w-[150px]">{getActionbuttons(order.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
