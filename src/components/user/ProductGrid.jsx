import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { axiosInstance } from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      const response =await axiosInstance.get('/products');
      setProducts(response.data.products)
    }


    fetchProducts()
  },[])

  const hanldeClick = (id) => {
    console.log(id)
    // toast.success(id)
    navigate(`/product/${id}`)
  }

  return (
    <div className="px-4 py-8">
      <h2 className="text-xl font-bold mb-6 text-center">HOT GAMES</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length>0 && products.filter((product)=> !product.isBlocked) .map((product) => (
          <ProductCard key={product._id} {...product} onClick= {hanldeClick} />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;

