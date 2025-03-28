import React from "react"
import Logo from "../../assets/Images/Logo.png"
export default function AboutUs() {
    return (
      <div className="bg-gray-100 min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">ABOUT US</h1>
  
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
              <h2 className="text-2xl font-bold mb-6">OUR STORY</h2>
  
              <div className="space-y-4 text-gray-700">
                <p>
                  Founded by Benson B. Vanor, XPWide was Born From An Unshakable Desire To Break Free From The Mundane And
                  Embrace The Extraordinary. Our Mission Is Clear: To Offer You Experiences That Transcend The Everyday,
                  Allowing You To Explore The Realms Of Freedom, Adventure, Serenity, And Love.
                </p>
  
                <p>
                  We Believe That Every Moment Of Life Is A Chance To Connect, Immerse, And Elevate. At XPWide, We
                  Handpick Products That Not Only Inspire Your Journey But Also Come At The Lowest Possible Prices, Making
                  It Easy For Everyone To Join The Adventure.
                </p>
  
                <p>Our Mantra Is Simple Yet Powerful:</p>
  
                <p className="font-semibold">BUY - PLAY - SELL - REPEAT</p>
  
                <p>
                  It's More Than Just A Slogan; It's A Philosophy That Connects Our Community Of Dreamers, Gamers, And
                  Adventurers. Life Is Short—Embrace It, Explore It, And Most Importantly, Enjoy It.
                </p>
  
                <p>To All Our XPWide Family Members: Thank You For Making This Journey Unforgettable.</p>
  
                <p>Happy Gaming, Happy Exploring, And Here's To Making The Most Of The One Life We Have!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }