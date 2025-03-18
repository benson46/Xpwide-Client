import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function SalesOverviewChart ({ data }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
      <LineChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};
