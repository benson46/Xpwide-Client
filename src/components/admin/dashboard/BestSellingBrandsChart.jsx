import React
 from "react";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
export const BestSellingBrandsChart = ({ data }) => {
  console.log(data)
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Top 5 Best-Selling Brands</h2>
        <BarChart width={800} height={400} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalRevenue" fill="#8884d8" />
        </BarChart>
      </div>
    );
  };