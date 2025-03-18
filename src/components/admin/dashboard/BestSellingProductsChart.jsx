import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export const BestSellingProductsChart = ({ data }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Top 10 Best-Selling Products</h2>
      <BarChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="productName" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalQuantity" fill="#82ca9d" />
      </BarChart>
    </div>
  );
};
