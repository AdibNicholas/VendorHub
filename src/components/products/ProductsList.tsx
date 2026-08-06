import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import ProductCard from "./ProductCard";
import EditProductForm from "./EditProductForm";

interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

interface ProductListProps {
  storeId: string;
}

function ProductList({ storeId }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId);

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  };
  const handleDelete = async (id: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Product deleted successfully!");

  fetchProducts();
};

  return (
    <div className="mt-10">
      {editingProduct && (
  <EditProductForm
    product={editingProduct}
    onCancel={() => setEditingProduct(null)}
  />
)}
      <h2 className="text-2xl font-bold mb-4">Products</h2>

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        products.map((product) => (
<ProductCard
  key={product.id}
  id={product.id}
  store_id={product.store_id}
  name={product.name}
  description={product.description}
  price={product.price}
  stock={product.stock}
  category={product.category}
  onDelete={handleDelete}
  onEdit={setEditingProduct}
/>
        ))
      )}
    </div>
  );
}

export default ProductList;