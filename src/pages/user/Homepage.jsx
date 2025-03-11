import React from "react";
import Categories from '../../components/user/Categories'
import ProductGrid from '../../components/user/ProductGrid'
import Banner from "./Banner";

export default function Homepage() {

  return (
    <div>
      <Banner/>
      <Categories />
      <ProductGrid />
    </div>
  );
}
