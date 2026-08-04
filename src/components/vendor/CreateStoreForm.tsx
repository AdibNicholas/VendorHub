import { useState } from "react";
import { supabase } from "../../lib/supabase";

function CreateStoreForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("You must be logged in.");
    return;
  }

  const { error } = await supabase
    .from("stores")
    .insert([
      {
        vendor_id: user.id,
        name,
        description,
        category,
      },
    ]);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Store created successfully!");

  setName("");
  setDescription("");
  setCategory("");
};

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">
        Create New Store
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">
            Store Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter store name"
            className="w-full border rounded-lg p-3"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your store"
            className="w-full border rounded-lg p-3"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg p-3"
            required
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Groceries">Groceries</option>
            <option value="Beauty">Beauty</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Furniture">Furniture</option>
            <option value="Books">Books</option>
            <option value="Pharmacy">Pharmacy</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
        >
          Create Store
        </button>
      </form>
    </div>
  );
}

export default CreateStoreForm;