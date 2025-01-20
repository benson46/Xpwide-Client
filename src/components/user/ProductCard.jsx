import React from 'react';

const ProductCard = ({ _id, name, price, discount, images, onClick}) => {

  console.log(images)

  return (
    <div className="relative group"  onClick={() => onClick(_id)}>
      <div className="relative">
        <img
          src={images[0]}
          alt={name}
          className="w-full h-48 object-cover rounded-lg"
        />
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
            {discount}% OFF
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium truncate">{name}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-lg font-bold">₹{price}</span>
          <button className="bg-black text-white px-4 py-1 rounded text-sm hover:bg-gray-800">
            BUY NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

