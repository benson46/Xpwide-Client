'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ResetPasswordEmail() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate('/otp-verification', { state: { email, from: 'reset-password' } });
    console.log('Reset password for:', email);
  };
  

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-2">Reset Your Password</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your registered Email
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="User@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  )
}
