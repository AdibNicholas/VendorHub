import { useNavigate } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../../constants/categories";

function CategoryGrid() {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(
      `/shop?category=${encodeURIComponent(category)}`
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-emerald-600 font-semibold mb-2">
          Explore VendorHub
        </p>

        <h3 className="text-3xl md:text-4xl font-bold">
          Browse Categories
        </h3>

        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
          Find products from different categories across
          VendorHub stores.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {PRODUCT_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => handleCategoryClick(category)}
            className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {category}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Shop {category}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default CategoryGrid;