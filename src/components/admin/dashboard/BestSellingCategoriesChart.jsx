import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const BestSellingCategoriesChart = ({ data }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Top 10 Best-Selling Categories</h2>
      <PieChart width={800} height={400}>
        <Pie
          data={data}
          dataKey="totalRevenue"
          nameKey="_id"
          cx="50%"
          cy="50%"
          outerRadius={150}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default BestSellingCategoriesChart