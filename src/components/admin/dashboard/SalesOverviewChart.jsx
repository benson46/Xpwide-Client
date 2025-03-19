import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function SalesOverviewChart({ data }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
      <BarChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalSales" name="Total Sales" fill="#8884d8" barSize={30} />
        <Bar dataKey="totalRevenue" name="Total Revenue" fill="#82ca9d" barSize={40} />
      </BarChart>
    </div>
  );
};