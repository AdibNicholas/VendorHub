import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);

    const { data: productData, error: productError } = await supabase
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

    const { data: storeData, error: storeError } = await supabase
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

    const { data: vendorData, error: vendorError } = await supabase
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
        store_name: store?.name || "Unknown Store",
        vendor_name: vendor?.full_name || "Unknown Vendor",
      };
    });

    setProducts(formattedProducts);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading products...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">
        Product Management
      </h1>

      <p className="text-gray-600 mb-8">
        Monitor and manage products across VendorHub.
      </p>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          No products found.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Store</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Affiliate</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t hover:bg-gray-50"
                  >
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

                    <td className="p-4">
                      {product.store_name}
                    </td>

                    <td className="p-4">
                      {product.vendor_name}
                    </td>

                    <td className="p-4 font-medium">
                      Le{" "}
                      {Number(product.price).toLocaleString()}
                    </td>

                    <td className="p-4">
                      {product.stock}
                    </td>

                    <td className="p-4">
                      {product.affiliate_enabled ? (
                        <div>
                          <span className="text-emerald-600 font-medium">
                            Enabled
                          </span>

                          {product.affiliate_commission !== null && (
                            <p className="text-sm text-gray-500">
                              {product.affiliate_commission} commission
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          Disabled
                        </span>
                      )}
                    </td>

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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;