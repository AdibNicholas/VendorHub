//function Home() {
  //return (
    //<div className="p-10">
      //<h1 className="text-5xl font-bold text-emerald-600">
        //Welcome to VendorHub
     // </h1>

      //<p className="mt-4 text-gray-600">
        //Connect vendors, customers and affiliate marketers.
      //</p>
    //</div>
  //);
//}

//export default Home;

import Hero from "../components/home/Hero";
import SearchBar from "../components/home/SearchBar";
import CategoryGrid from "../components/home/CategoryGrid";
import FeaturedStores from "../components/home/FeaturedStores";
import LatestProducts from "../components/home/LatestProducts";
import Layout from "../components/layout/Layout";

function Home() {
  return (
    <>
      <Hero />
      <SearchBar />
      <CategoryGrid />
      <FeaturedStores />
       <LatestProducts />
       <Layout>
  ...
</Layout>
    </>
  );
}
export default Home;