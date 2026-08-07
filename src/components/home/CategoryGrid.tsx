const categories = [
  "Agriculture",
  "Electronics",
  "Fashion",
  "Beauty",
  "Furniture",
  "Books",
  "Pharmacy",
  "Groceries",
];

function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-10">
        Browse Categories
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category}
            className="bg-white shadow rounded-xl p-8 text-center hover:shadow-lg hover:scale-105 transition cursor-pointer"
          >
            <h3 className="text-xl font-semibold">
              {category}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CategoryGrid;