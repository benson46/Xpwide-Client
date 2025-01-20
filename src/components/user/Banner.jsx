import React from 'react';
import BannerImage from '../../assets/Images/Banner.jpg'
const Banner = () => {
  return (
    <div className="relative  h-[600px]  flex justify-center bg-[#D9D9D9]  p-2 ">
      <img
        src={BannerImage}
        alt="Grand Theft Auto V"
        className=" w-[70%]  h-full  content-center object-center"
      />
    </div>
  );
};

export default Banner;

