import React, { useEffect } from "react";
import PropTypes from "prop-types"; 
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const AdminAuth = ({ children }) => {
  const { adminInfo } = useSelector((state) => state.admin);

  useEffect(() => {
    console.log("Admin info in local storage:", adminInfo);
  }, [adminInfo]);

  if (!adminInfo) {
    return <Navigate to="/admin" />;
  }
   else {
    return <>{children}</>;
  }
};

AdminAuth.propTypes = {
  children: PropTypes.node.isRequired,
};

export const AdminRequireAuth = ({ children }) => {
  const { adminInfo } = useSelector((state) => state.admin);

  if (adminInfo) {
    return <Navigate to="/admin/dashboard" />;
  } else {
    return <>{children}</>;
  }
};

AdminRequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
};
