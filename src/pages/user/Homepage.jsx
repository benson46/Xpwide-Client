import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import Navbar from '../../components/user/Navbar'
import Banner from '../../components/user/Banner'
import Categories from '../../components/user/Categories'
import ProductGrid from '../../components/user/ProductGrid'

export default function Homepage() {
  const isBlocked = useSelector((state) => state.user?.user?.isBlocked);

  useEffect(() => {
    if (isBlocked) {
      window.location.reload();
    }
  }, [isBlocked]); 

  return (
    <div>
      <Navbar />
      <Banner />
      <Categories />
      <ProductGrid />
    </div>
  );
}
