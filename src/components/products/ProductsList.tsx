import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import EditProductForm from "./EditProductForm";

interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category: string | null;
  affiliate_enabled: boolean;
  affiliate_commission: number;
  is_active: boolean;
  created_at: string;
}

interface Store {
  id: string;
  name: string;
}

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Unable to get user:", userError);
      setLoading(false);
      return;
    }

    const { data: storeData, error: storeError } = await supabase
      .from("stores")
      .select("id, name")
      .eq("vendor_id", user.id)
      .order("name");

    if (storeError) {
      console.error("Error loading stores:", storeError);
      setLoading(false);
      return;
    }

    const vendorStores = storeData || [];
    setStores(vendorStores);

    if (vendorStores.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const storeIds = vendorStores.map((store) => store.id);

    const { data: productData, error: productError } =
      await supabase
        .from("products")
        .select("*")
        .in("store_id", storeIds)
        .order("created_at", { ascending: false });

    if (productError) {
      console.error("Error loading products:", productError);
      setLoading(false);
      return;
    }

    setProducts(productData || []);
    setLoading(false);
  };

  const getStoreName = (storeId: string) => {
    const store = stores.find((store) => store.id === storeId);
    return store?.name || "Unknown Store";
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (product.category || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStore =
        storeFilter === "all" ||
        product.store_id === storeFilter;

      let matchesStock = true;

      if (stockFilter === "in-stock") {
        matchesStock = product.stock > 0;
      }

      if (stockFilter === "low-stock") {
        matchesStock =
          product.stock > 0 && product.stock <= 5;
      }

      if (stockFilter === "out-of-stock") {
        matchesStock = product.stock === 0;
      }

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.is_active) ||
        (statusFilter === "inactive" && !product.is_active);

      return (
        matchesSearch &&
        matchesStore &&
        matchesStock &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    storeFilter,
    stockFilter,
    statusFilter,
  ]);

  const toggleProductStatus = async (
    product: Product
  ) => {
    const newStatus = !product.is_active;

    const { error } = await supabase
      .from("products")
      .update({
        is_active: newStatus,
      })
      .eq("id", product.id);

    if (error) {
      console.error("Error updating product:", error);
      alert(`Unable to update product: ${error.message}`);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.map((item) =>
        item.id === product.id
          ? {
              ...item,
              is_active: newStatus,
            }
          : item
      )
    );
  };

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error("Error deleting product:", error);
      alert(`Unable to delete product: ${error.message}`);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (item) => item.id !== product.id
      )
    );

    alert("Product deleted successfully.");
  };

  if (editingProduct) {
    return (
      <EditProductForm
        product={editingProduct}
        onUpdated={() => {
          setEditingProduct(null);
          fetchProducts();
        }}
        onCancel={() => {
          setEditingProduct(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-xl p-6">
        <p className="text-gray-500">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            My Products
          </h2>

          <p className="text-gray-500 mt-1">
            Manage products from your stores.
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-semibold">
          {filteredProducts.length} of {products.length} Products
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 border rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name or category..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Store */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store
            </label>

            <select
              value={storeFilter}
              onChange={(e) =>
                setStoreFilter(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">
                All Stores
              </option>

              {stores.map((store) => (
                <option
                  key={store.id}
                  value={store.id}
                >
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>

            <select
              value={stockFilter}
              onChange={(e) =>
                setStockFilter(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">
                All Stock
              </option>

              <option value="in-stock">
                In Stock
              </option>

              <option value="low-stock">
                Low Stock
              </option>

              <option value="out-of-stock">
                Out of Stock
              </option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

        </div>

        {/* Clear filters */}
        {(search ||
          storeFilter !== "all" ||
          stockFilter !== "all" ||
          statusFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setStoreFilter("all");
              setStockFilter("all");
              setStatusFilter("all");
            }}
            className="mt-4 text-sm text-emerald-600 font-semibold hover:text-emerald-700"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* No products */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            You haven't added any products yet.
          </p>

          <p className="text-gray-400 mt-2">
            Use the Add New Product form above to
            create your first product.
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No products match your filters.
          </p>

          <button
            onClick={() => {
              setSearch("");
              setStoreFilter("all");
              setStockFilter("all");
              setStatusFilter("all");
            }}
            className="mt-4 text-emerald-600 font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="py-4 px-3">
                  Product
                </th>

                <th className="py-4 px-3">
                  Store
                </th>

                <th className="py-4 px-3">
                  Category
                </th>

                <th className="py-4 px-3">
                  Price
                </th>

                <th className="py-4 px-3">
                  Stock
                </th>

                <th className="py-4 px-3">
                  Status
                </th>

                <th className="py-4 px-3">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b last:border-b-0 hover:bg-gray-50"
                >
                  {/* Product */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">

                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          
                        </div>
                      )}

                      <div>
                        <p className="font-semibold">
                          {product.name}
                        </p>

                        {product.description && (
                          <p className="text-sm text-gray-500 max-w-xs truncate">
                            {product.description}
                          </p>
                        )}
                      </div>

                    </div>
                  </td>

                  {/* Store */}
                  <td className="py-4 px-3">
                    <span className="text-sm">
                      {getStoreName(product.store_id)}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-3">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {product.category ||
                        "Uncategorized"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-3 font-semibold">
                    Le{" "}
                    {Number(
                      product.price
                    ).toLocaleString()}
                  </td>

                  {/* Stock */}
                  <td className="py-4 px-3">
                    <span
                      className={
                        product.stock === 0
                          ? "text-red-600 font-semibold"
                          : product.stock <= 5
                          ? "text-orange-600 font-semibold"
                          : "text-gray-700"
                      }
                    >
                      {product.stock}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-3">
                    <button
                      onClick={() =>
                        toggleProductStatus(product)
                      }
                      className={
                        product.is_active
                          ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold"
                          : "bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold"
                      }
                    >
                      {product.is_active
                        ? "Active"
                        : "Inactive"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-3">
                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          setEditingProduct(product)
                        }
                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteProduct(product)
                        }
                        className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm hover:bg-red-200"
                      >
                        Delete
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductList;