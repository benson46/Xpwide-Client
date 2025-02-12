import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../services/api";
import PropTypes from "prop-types"; // Import PropTypes
import toast from "react-hot-toast";

const GoogleLogin = (props) => {
  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        console.log(authResult.code);
        const result = await googleAuth(authResult.code);
        props.setUser(result.data.data.user);
        toast.success("Successfully logged in");
      } else {
        console.log(authResult);
        throw new Error(authResult);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <button
      style={{
        padding: "10px 20px",
      }}
      onClick={googleLogin}
    >
      Sign in with Google
    </button>
  );
};

// Prop types validation
GoogleLogin.propTypes = {
  setUser: PropTypes.func.isRequired,
};

GoogleLogin.displayName = "GoogleLogin"; // Adding display name

export default GoogleLogin;
