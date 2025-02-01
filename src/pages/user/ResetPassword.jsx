import React from 'react';
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom' 
import { axiosInstance } from '../../utils/axios'
import toast from 'react-hot-toast' 

export default function ResetPassword() {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if passwords match
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
  
    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
  
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(passwords.newPassword)) {
      toast.error(
        'Password must include uppercase, lowercase, a number, and a special character.'
      );
      return;
    }
  
    try {
      await axiosInstance.post('/reset-password', {
        password: passwords.newPassword,
        email,
      });
  
      toast.success('Password reset successfully!');
      navigate('/login'); 
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };
  

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Reset Your Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  )
}
