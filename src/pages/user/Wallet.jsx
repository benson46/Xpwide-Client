import { useState, useEffect } from "react"
import { Download, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { axiosInstance } from "../../utils/axios"

export default function Wallet() {
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch wallet details when the component mounts
  useEffect(() => {
    const fetchWalletDetails = async () => {
      try {
        const response = await axiosInstance.get("/wallet");
        console.log(response.data)
        setBalance(response.data.wallet.balance);
        setTransactions(response.data.wallet.transactions);
      } catch (err) {
        setError("Failed to fetch wallet details.");
      } finally {
        setLoading(false);
      }
    }

    fetchWalletDetails();
  }, [])

  // Add money to the wallet by calling the backend API
  const handleAddMoney = async () => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post("/wallet", {
        amount: numAmount,
        paymentStatus: "success" // For simplicity, assuming payment status is "success"
      });
      console.log('respnse 2',response)
      setBalance(response.data.wallet.balance);
      setTransactions(response.data.wallet.transactions);
      setAmount("5000"); // Reset input field
    } catch (err) {
      setError("Failed to update wallet.");
    } finally {
      setLoading(false);
    }
  }

  const handleQuickAdd = (value) => {
    setAmount(value.toString())
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3">Wallet</h1>
          <div className="text-2xl font-medium text-primary">Balance: ₹ {balance.toLocaleString("en-IN")}</div>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>} {/* Error Message */}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Add Money Section */}
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Add Money to Wallet</h2>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-2">Enter Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 p-2 w-full border rounded-md text-lg"
                  disabled={loading} // Disable input while loading
                />
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              {[500, 1000, 2000].map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickAdd(value)}
                  className="flex-1 py-2 text-base bg-gray-100 border rounded-md hover:bg-gray-200"
                  disabled={loading} // Disable buttons while loading
                >
                  + ₹{value}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddMoney}
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-lg rounded-md"
              disabled={loading} // Disable button while loading
            >
              {loading ? "Adding..." : "Add to Wallet"}
            </button>
          </div>

          {/* Transaction History Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <Download className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Transaction History</h2>
            </div>

            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {transaction.type === "credit" ? (
                        <div className="bg-green-50 p-2 rounded-full">
                          <ArrowUpCircle className="w-6 h-6 text-green-500" />
                        </div>
                      ) : (
                        <div className="bg-red-50 p-2 rounded-full">
                          <ArrowDownCircle className="w-6 h-6 text-red-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-base">{transaction.description}</p>
                        {console.log(transaction)}
                        <p className="text-sm text-gray-500">{transaction.transactionDate}</p>
                      </div>
                    </div>
                    <span
                      className={`font-medium text-lg ${
                        transaction.type === "credit" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"} ₹{transaction.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
