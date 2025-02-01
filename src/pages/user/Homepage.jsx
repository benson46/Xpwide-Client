import React from "react";
import Banner from '../../components/user/Banner'
import Categories from '../../components/user/Categories'
import ProductGrid from '../../components/user/ProductGrid'

export default function Homepage() {

  return (
    <div>
      <Banner />
      <Categories />
      <ProductGrid />
    </div>
  );
}
