import Hero from "../components/home/Hero";
import SearchBar from "../components/home/SearchBar";
import CategoryGrid from "../components/home/CategoryGrid";
import FeaturedStores from "../components/home/FeaturedStores";
import LatestProducts from "../components/home/LatestProducts";

function Home() {
  return (
    <>
      <Hero />
      <SearchBar />
      <CategoryGrid />
      <LatestProducts />
      <FeaturedStores />
    </>
  );
}

export default Home;