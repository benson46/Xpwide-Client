import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import { adminAxiosInstance } from "../../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../../store/adminSlice";

export default function Dashboard() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [period, setPeriod] = useState("daily");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const admin = useSelector((state) => state.admin)
const dispatch = useDispatch();
  useEffect(()=>{
    if(!admin){
      dispatch(adminLogout())
    }
  })

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAxiosInstance.get("/sales-report", {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          period,
        },
      });
      setReportData(response.data.data);
    } catch (err) {
      setError("Failed to fetch sales report. Please try again.");
      console.error("Error fetching sales report:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type) => {
    try {
      setLoading(true);
      const response = await adminAxiosInstance.get(`/download-report/${type}`, {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          period,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      if(type === "excel"){
        link.setAttribute("download", `Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      }else{
      link.setAttribute("download", `sales_report.${type}`);
      }
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to download ${type.toUpperCase()} report. Please try again.`);
      console.error(`Error downloading ${type} report:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex">
        <Sidebar activePage="Dashboard" />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Sales Dashboard</h1>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Report Filters</h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm mb-2">Period</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-gray-700 rounded p-2 min-w-[150px] text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {period === "custom" && (
                <>
                  <div>
                    <label className="block text-sm mb-2">Start Date</label>
                    <DatePicker
                      selected={startDate}
                      onChange={setStartDate}
                      className="bg-gray-700 rounded p-2 text-white"
                      maxDate={endDate || new Date()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">End Date</label>
                    <DatePicker
                      selected={endDate}
                      onChange={setEndDate}
                      className="bg-gray-700 rounded p-2 text-white"
                      minDate={startDate}
                      maxDate={new Date()}
                    />
                  </div>
                </>
              )}

              <button
                onClick={fetchSalesReport}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Generate Report"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {reportData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
                  <p className="text-2xl font-bold">{reportData.summary.totalSales}</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Total Amount</h3>
                  <p className="text-2xl font-bold">
                  ₹{reportData.summary.totalAmount}
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Total Discount</h3>
                  <p className="text-2xl font-bold">
                  ₹{reportData.summary.totalDiscount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => downloadReport('pdf')}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF Report
                </button>
                <button
                  onClick={() => downloadReport('excel')}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Excel Report
                </button>
              </div>

              {/* Sales Table */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-700">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Products</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.reports.map((sale) => (
                        <tr key={sale.orderId} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="py-3 px-4">
                            {new Date(sale.orderDate).toLocaleDateString()}
                            {console.log(sale)}
                          </td>
                          <td className="py-3 px-4">{`${sale.customer.firstName}`}</td>
                          <td className="py-3 px-4">{sale.product.length}</td>
                          <td className="py-3 px-4">₹{sale.finalAmount.toFixed(2)}</td>
                          <td className="py-3 px-4">{sale.paymentMethod}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                              sale.deliveryStatus === 'Delivered' ? 'bg-green-500' :
                              sale.deliveryStatus === 'Pending' ? 'bg-yellow-500' :
                              sale.deliveryStatus === 'Cancelled' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`}>
                              {sale.deliveryStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}