//import { useState } from "react";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
interface AddProductFormProps {
  storeId: string;
}

function AddProductForm({ storeId }: AddProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  console.log("Current Store ID:", storeId);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const { error } = await supabase.from("products").insert([
    {
      store_id: storeId,
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
      affiliate_enabled: true,
      affiliate_commission: 0,
    },
  ]);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Product added successfully!");

  setName("");
  setDescription("");
  setPrice("");
  setStock("");
  setCategory("");
};
  return (
    <div className="bg-white shadow rounded-xl p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Add Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">
            Product Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="Enter product name"
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
            className="w-full border rounded-lg p-3"
            rows={4}
            placeholder="Product description"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Price (Le)
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Stock Quantity
          </label>

          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Category
          </label>

          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg p-3"
            placeholder="Category"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}

export default AddProductForm;