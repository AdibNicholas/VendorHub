import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      navigate("/shop");
      return;
    }

    navigate(
      `/shop?search=${encodeURIComponent(value)}`
    );
  };

  return (
    <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
      <form
        onSubmit={handleSearch}
        className="bg-white shadow-xl rounded-xl p-4 flex flex-col sm:flex-row gap-3"
      >
        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search for products, stores..."
          className="flex-1 border rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          type="submit"
          className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition"
        >
          Search
        </button>
      </form>
    </section>
  );
}

export default SearchBar;