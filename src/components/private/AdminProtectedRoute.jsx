import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const AdminAuth = ({ children }) => {
  const { adminInfo } = useSelector((state) => state.admin);

  useEffect(() => {
    console.log("AdminAuth Status:", adminInfo);
  }, [adminInfo]);

  if (!adminInfo) {
    return <Navigate to="/admin" />;
  } else {
    return <>{children}</>;
  }
};

export const AdminRequireAuth = ({ children }) => {
  const { adminInfo } = useSelector((state) => state.admin);

  if (adminInfo) {
    return <Navigate to="/admin/dashboard" />;
  } else {
    return <>{children}</>;
  }
};
