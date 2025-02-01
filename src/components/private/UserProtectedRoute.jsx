import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const UserAuth = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  useEffect(() => {
    console.log(isAuthenticated);
  }, []);
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  } else {
    return <>{children}</>;
  }
};
UserAuth.propTypes = {
  children: PropTypes.node.isRequired,
};

export const UserRequireAuth = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  } else {
    return <>{children}</>;
  }
};

UserRequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
};
