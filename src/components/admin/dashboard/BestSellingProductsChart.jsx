import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-700 p-3 rounded-lg">
        <p className="font-semibold">{payload[0].payload.productName}</p>
        <p>Quantity Sold: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const BestSellingProductsChart = ({ data }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Top 10 Best-Selling Products</h2>
      <BarChart width={900} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="productName" angle={-15} textAnchor="end" interval={0} />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="totalQuantity" fill="#82ca9d" name="Quantity Sold" />
      </BarChart>
    </div>
  );
};
