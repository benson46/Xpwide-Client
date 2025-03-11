"use client";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { adminAxiosInstance } from "../../utils/axios";

const CustomArrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 z-10 bg-yellow-500 p-2 rounded-full hover:bg-yellow-600 transition-colors ${
      direction === "prev" ? "left-4" : "right-4"
    }`}
    aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
  >
    <svg
      className="w-6 h-6 text-black"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {direction === "prev" ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      )}
    </svg>
  </button>
);

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await adminAxiosInstance.get("/banners");
        setBanners(res.data.banners.filter(b => b.isActive));
      } catch (error) {
        console.error("Banner fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    prevArrow: <CustomArrow direction="prev" />,
    nextArrow: <CustomArrow direction="next" />,
    appendDots: dots => (
      <ul className="!bottom-4 flex justify-center space-x-2">{dots}</ul>
    ),
    customPaging: () => (
      <button className="w-3 h-3 rounded-full bg-white opacity-50 transition-all duration-300 [.slick-active_&]:opacity-100 [.slick-active_&]:bg-yellow-500" />
    ),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        }
      }
    ]
  };

  if (loading) return <div className="h-[500px] bg-gray-200 animate-pulse"></div>;

  return (
    <div className="relative h-[500px] overflow-hidden mb-8">
      {banners.length > 0 ? (
        <Slider {...settings}>
          {banners.map((banner) => (
            <div key={banner._id}>
              <div className="relative h-[500px]">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white max-w-2xl px-4">
                    <h2 className="text-4xl font-bold mb-4">{banner.title}</h2>
                    <a
                      href={banner.link}
                      className="inline-block bg-yellow-500 text-black px-8 py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="h-full bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">No active banners available</p>
        </div>
      )}
    </div>
  );
}