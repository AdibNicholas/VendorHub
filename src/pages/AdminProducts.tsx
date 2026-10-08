import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import EditProductForm from "../components/products/EditProductForm";

interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  affiliate_enabled: boolean;
  affiliate_commission: number | null;
  is_active: boolean;
  created_at: string;
}

interface ProductWithDetails extends Product {
  store_name: string;
  vendor_name: string;
}


function AdminProducts() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);

    const { data: productData, error: productError } =
      await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (productError) {
      console.error(
        "Error fetching products:",
        productError.message
      );
      setLoading(false);
      return;
    }

    const { data: storeData, error: storeError } =
      await supabase
        .from("stores")
        .select("id, vendor_id, name");

    if (storeError) {
      console.error(
        "Error fetching stores:",
        storeError.message
      );
      setLoading(false);
      return;
    }

    const { data: vendorData, error: vendorError } =
      await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "vendor");

    if (vendorError) {
      console.error(
        "Error fetching vendors:",
        vendorError.message
      );
      setLoading(false);
      return;
    }

    const formattedProducts: ProductWithDetails[] = (
      productData || []
    ).map((product) => {
      const store = (storeData || []).find(
        (store) => store.id === product.store_id
      );

      const vendor = (vendorData || []).find(
        (vendor) => vendor.id === store?.vendor_id
      );

      return {
        ...product,
        store_name:
          store?.name || "Unknown Store",
        vendor_name:
          vendor?.full_name || "Unknown Vendor",
      };
    });

    setProducts(formattedProducts);
    setLoading(false);
  };

  const stores = useMemo(() => {
    return Array.from(
      new Map(
        products.map((product) => [
          product.store_id,
          product.store_name,
        ])
      ).entries()
    );
  }, [products]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.category)
          .filter(
            (category): category is string =>
              Boolean(category)
          )
      )
    ).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        searchText === "" ||
        product.name
          .toLowerCase()
          .includes(searchText) ||
        product.store_name
          .toLowerCase()
          .includes(searchText) ||
        product.vendor_name
          .toLowerCase()
          .includes(searchText);

      const matchesStore =
        storeFilter === "all" ||
        product.store_id === storeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        product.category === categoryFilter;

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

      return (
        matchesSearch &&
        matchesStore &&
        matchesCategory &&
        matchesStock
      );
    });
  }, [
    products,
    search,
    storeFilter,
    categoryFilter,
    stockFilter,
  ]);

  const handleToggleActive = async (
    product: ProductWithDetails
  ) => {
    const action = product.is_active
      ? "disable"
      : "enable";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        is_active: !product.is_active,
      })
      .eq("id", product.id);

    if (error) {
      console.error(
        "Error updating product:",
        error.message
      );
      alert(error.message);
      return;
    }

    await fetchProducts();
  };

  const handleDelete = async (
    product: ProductWithDetails
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${product.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error(
        "Error deleting product:",
        error.message
      );
      alert(error.message);
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (item) => item.id !== product.id
      )
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading products...
      </div>
    );
  }

  if (editingProduct) {
    return (
      <div className="max-w-7xl mx-auto p-8">
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
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Product Management
        </h1>

        <p className="text-gray-600 mt-2">
          Monitor and manage products across
          VendorHub.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
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
              placeholder="Search product, store or vendor..."
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">
                All Stores
              </option>

              {stores.map(([storeId, storeName]) => (
                <option
                  key={storeId}
                  value={storeId}
                >
                  {storeName}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">
                All Stock
              </option>

              <option value="in-stock">
                In Stock
              </option>

              <option value="low-stock">
                Low Stock (1–5)
              </option>

              <option value="out-of-stock">
                Out of Stock
              </option>
            </select>
          </div>

        </div>

        {/* Clear filters */}
        {(search ||
          storeFilter !== "all" ||
          categoryFilter !== "all" ||
          stockFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setStoreFilter("all");
              setCategoryFilter("all");
              setStockFilter("all");
            }}
            className="mt-4 text-sm text-emerald-600 font-semibold hover:text-emerald-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results */}
      <div className="mb-4 text-gray-600">
        Showing{" "}
        <span className="font-semibold">
          {filteredProducts.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold">
          {products.length}
        </span>{" "}
        products
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          No products found.
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          No products match your filters.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">
                    Product
                  </th>

                  <th className="p-4">
                    Store
                  </th>

                  <th className="p-4">
                    Vendor
                  </th>

                  <th className="p-4">
                    Price
                  </th>

                  <th className="p-4">
                    Stock
                  </th>

                  <th className="p-4">
                    Affiliate
                  </th>

                  <th className="p-4">
                    Status
                  </th>

                  <th className="p-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product) => (
                    <tr
                      key={product.id}
                      className="border-t hover:bg-gray-50"
                    >
                      {/* Product */}
                      <td className="p-4">
                        <p className="font-medium">
                          {product.name}
                        </p>

                        {product.category && (
                          <p className="text-sm text-gray-500">
                            {product.category}
                          </p>
                        )}
                      </td>

                      {/* Store */}
                      <td className="p-4">
                        {product.store_name}
                      </td>

                      {/* Vendor */}
                      <td className="p-4">
                        {product.vendor_name}
                      </td>

                      {/* Price */}
                      <td className="p-4 font-medium">
                        Le{" "}
                        {Number(
                          product.price
                        ).toLocaleString()}
                      </td>

                      {/* Stock */}
                      <td className="p-4">
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

                      {/* Affiliate */}
                      <td className="p-4">
                        {product.affiliate_enabled ? (
                          <div>
                            <span className="text-emerald-600 font-medium">
                              Enabled
                            </span>

                            {product.affiliate_commission !==
                              null && (
                              <p className="text-sm text-gray-500">
                                {
                                  product.affiliate_commission
                                }{" "}
                                commission
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            Disabled
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {product.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">

                          <button
                            onClick={() =>
                              setEditingProduct(
                                product
                              )
                            }
                            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleToggleActive(
                                product
                              )
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              product.is_active
                                ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                          >
                            {product.is_active
                              ? "Disable"
                              : "Enable"}
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                product
                              )
                            }
                            className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200"
                          >
                            Delete
                          </button>

                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>

            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;