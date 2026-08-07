function SearchBar() {
  return (
    <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
      <div className="bg-white shadow-xl rounded-xl p-5">

        <input
          type="text"
          placeholder="Search for products, stores..."
          className="w-full border rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

      </div>
    </section>
  );
}

export default SearchBar;