import React from 'react';
import PropTypes from 'prop-types';

const ProductCard = ({
  _id,
  name,
  price = 0, // default to 0 if not provided
  images = [],
  onClick,
  hasOffer = false,        
  discountedPrice,  // no default here so that we can check if it's provided
  offer = null,            
  stock = 0,           
}) => {
  // If the product has an offer and a discountedPrice is provided, use it.
  // Otherwise, fallback to the original price.
  const effectiveDiscountedPrice =
    hasOffer && typeof discountedPrice === 'number' ? discountedPrice : price;

  return (
    <div className="relative group cursor-pointer" onClick={() => onClick(_id)}>
      <div className="relative">
        <img
          src={images[0]}
          alt={name}
          className="w-full h-[400px] object-cover rounded-lg"
        />
        {/* Show discount badge if an offer exists */}
        {hasOffer && offer && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
            {offer.value}% OFF
          </div>
        )}
        {/* Out-of-stock overlay */}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium truncate">{name}</h3>
        <div className="flex justify-between items-center mt-1">
          <div>
            {hasOffer ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">
                  ₹{effectiveDiscountedPrice.toFixed(2)}
                </span>
                <span className="text-sm line-through text-gray-500">
                  ₹{price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold">₹{price.toFixed(2)}</span>
            )}
          </div>
          <button className="bg-black text-white px-4 py-1 rounded text-sm hover:bg-gray-800">
            BUY NOW
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  _id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClick: PropTypes.func.isRequired,
  // These fields come directly from the product object returned by the backend.
  hasOffer: PropTypes.bool,
  discountedPrice: PropTypes.number,
  offer: PropTypes.shape({
    value: PropTypes.number,
  }),
  stock: PropTypes.number,
};

export default ProductCard;
