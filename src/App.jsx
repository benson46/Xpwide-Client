import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";

function App() {
  
  return (
    <>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* User routes */}
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
    </>
  );
}

export default App;
