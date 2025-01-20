import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import validate from "../../utils/validate";
import { axiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";

export default function Signup() {
  const { loading } = useSelector((state) => state.user);
  const [error, setError] = useState(null);
  const [validateError, setValidateError] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setValidateError(null);

    if (formData.confirmPassword != formData.password) {
      return setError("Password and Conform Password is Not match");
    }

    const validateError = validate(formData);
    setValidateError(validateError);

    if (Object.keys(validateError).length >= 4) {
      setError("Please enter the details properly");
      return;
    }

    if (Object.keys(validateError).length === 0) {
      try {
        await axiosInstance.post("/send-otp", { formData });
        navigate("/otp-verification", {
          state: { email: formData.email, from: "signup" },
        });
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* <div className="mb-8">
        <img src="/logo.png" alt="XPWide Logo" className="h-8 w-auto" />
      </div> */}

      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-8">
          Account Signup
        </h1>

        {error && <p className="text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First name
            </label>
            {validateError?.firstName && (
              <p className="text-red-600">{validateError.firstName}</p>
            )}
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last name
            </label>
            {validateError?.lastName && (
              <p className="text-red-600">{validateError.lastName}</p>
            )}

            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            {validateError?.email && (
              <p className="text-red-600">{validateError.email}</p>
            )}

            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            {validateError?.phoneNumber && (
              <p className="text-red-600">{validateError.phoneNumber}</p>
            )}

            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            {validateError?.password && (
              <p className="text-red-600">{validateError.password}</p>
            )}

            <input
              type="text"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>
            <input
              type="text"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className={`w-full text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
