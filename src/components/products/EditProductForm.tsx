//import { useState, useEffect } from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface EditProductFormProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    category: string | null;
  };

  onUpdated: () => void;
  onCancel: () => void;
}

function EditProductForm({
  product,
  onUpdated,
  onCancel,
}: EditProductFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  

  useEffect(() => {
    setName(product.name);
   setDescription(product.description ?? "");
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setCategory(product.category ?? "");
  }, [product]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const { error } = await supabase
    .from("products")
    .update({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      category,
    })
    .eq("id", product.id);
if (error) {
  console.error(error);
  alert(error.message);
  return;
}

  alert("Product updated successfully!");

onUpdated();
};

  return (
    <div className="bg-white shadow rounded-xl p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Edit Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded-lg p-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full border rounded-lg p-3"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          className="w-full border rounded-lg p-3"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="number"
          className="w-full border rounded-lg p-3"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <input
          className="w-full border rounded-lg p-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <div className="flex gap-4">
         <button
  type="button"
  onClick={onCancel}
>
  Cancel
</button>

          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}


export default EditProductForm;