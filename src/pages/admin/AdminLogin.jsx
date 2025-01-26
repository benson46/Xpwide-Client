import { useState } from "react";
import { useDispatch } from "react-redux";
import { adminLogin } from "../../store/adminSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      dispatch(adminLogin(formData))
        .unwrap()
        .then((res) => {
          toast.success("Login success");
          navigate("/admin/dashboard");
        });
    } catch (error) {
      toast.error(error)
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Logo */}
      {/* <div className="mb-8">
        <Image 
          src="/placeholder.svg"
          alt="XPWide Logo"
          width={150}
          height={60}
          className="h-15 w-auto"
        />
      </div> */}

      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="border border-blue-500 rounded-lg p-6 space-y-6"
        >
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-gray-400 text-sm">
              Only admins are allowed to login through this interface
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-white mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-2 rounded hover:bg-gray-100 transition-colors font-medium"
          >
            Login Account
          </button>
        </form>
      </div>
    </div>
  );
}
