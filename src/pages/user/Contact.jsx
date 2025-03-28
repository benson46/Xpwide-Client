import React from 'react'
import Logo from "../../assets/Images/Logo.png"
export default function Contact() {
    return (
      <div className="bg-gray-100 min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">CONTACT US</h1>
  
          <div className="bg-white p-6 md:p-10 rounded-lg shadow-sm flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 flex flex-col items-center justify-center">
              <div className="w-48 h-48 relative mb-4">
                <img
                  src={Logo}
                  alt="XPWide Logo"
                  width={192}
                  height={192}
                  className="object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold">XPWide</h2>
            </div>
  
            <div className="md:w-1/2">
              <h2 className="text-2xl font-bold mb-6">GET IN TOUCH</h2>
  
              <div className="space-y-4 text-gray-700">
                <p>
                  We’d love to hear from you! Whether you have questions, feedback, or just want to say hello, feel free to
                  reach out. Our team at XPWide is here to assist you on your journey.
                </p>
  
                <div className="space-y-2">
                  <p className="font-semibold">Email:</p>
                  <p>
                    <a href="mailto:xpwidestore@gmail.com" className="text-blue-600 hover:underline">
                      xpwidestore@gmail.com
                    </a>
                  </p>
                </div>
  
                <div className="space-y-2">
                  <p className="font-semibold">Phone:</p>
                  <p>+91 89433 93066</p>
                </div>
  
                <div className="space-y-2">
                  <p className="font-semibold">Address:</p>
                  <p>123 Adventure Lane, Explorer City, EX 56789</p>
                </div>
  
                <p>Let’s connect and make your experience extraordinary!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }