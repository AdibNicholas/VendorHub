import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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
}

interface Store {
  id: string;
  name: string;
}

interface EditProductFormProps {
  product: Product;
  onUpdated: () => void;
  onCancel: () => void;
}

function EditProductForm({
  product,
  onUpdated,
  onCancel,
}: EditProductFormProps) {
  const [stores, setStores] = useState<Store[]>([]);

  const [storeId, setStoreId] = useState(product.store_id);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(
    product.description || ""
  );
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [category, setCategory] = useState(
    product.category || ""
  );
  const [imageUrl, setImageUrl] = useState(
    product.image_url || ""
  );
  const [affiliateEnabled, setAffiliateEnabled] = useState(
    product.affiliate_enabled
  );
  const [affiliateCommission, setAffiliateCommission] =
    useState(
      String(product.affiliate_commission || "")
    );

  const [saving, setSaving] = useState(false);
  const [loadingStores, setLoadingStores] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoadingStores(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Unable to get user:", userError);
      setLoadingStores(false);
      return;
    }

    const { data, error } = await supabase
      .from("stores")
      .select("id, name")
      .eq("vendor_id", user.id)
      .order("name");

    if (error) {
      console.error("Error loading stores:", error);
    } else {
      setStores(data || []);
    }

    setLoadingStores(false);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!storeId) {
      alert("Please select a store.");
      return;
    }

    if (!name.trim()) {
      alert("Please enter a product name.");
      return;
    }

    if (!price || Number(price) < 0) {
      alert("Please enter a valid price.");
      return;
    }

    if (!stock || Number(stock) < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    if (
      affiliateEnabled &&
      (!affiliateCommission ||
        Number(affiliateCommission) < 0)
    ) {
      alert("Please enter a valid affiliate commission.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("products")
      .update({
        store_id: storeId,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        category: category.trim(),
        image_url: imageUrl.trim() || null,
        affiliate_enabled: affiliateEnabled,
        affiliate_commission: affiliateEnabled
          ? Number(affiliateCommission)
          : 0,
      })
      .eq("id", product.id);

    if (error) {
      console.error("Error updating product:", error);
      alert(`Unable to update product: ${error.message}`);
      setSaving(false);
      return;
    }

    alert("Product updated successfully!");

    setSaving(false);
    onUpdated();
  };

  return (
    <div className="bg-white border border-emerald-200 shadow rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Edit Product
          </h2>

          <p className="text-gray-500 mt-1">
            Update your product information.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      {loadingStores ? (
        <p className="text-gray-500">
          Loading your stores...
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Store
            </label>

            <select
              value={storeId}
              onChange={(e) =>
                setStoreId(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3"
              required
            >
              <option value="">
                Select a store
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

          <div>
            <label className="block text-sm font-medium mb-2">
              Product Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={4}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stock
              </label>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
                className="w-full border rounded-lg px-4 py-3"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Category
            </label>

            <input
              type="text"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Image URL
            </label>

            <input
              type="url"
              value={imageUrl}
              onChange={(e) =>
                setImageUrl(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3"
              placeholder="https://example.com/product.jpg"
            />
          </div>

          <div className="border rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={affiliateEnabled}
                onChange={(e) =>
                  setAffiliateEnabled(e.target.checked)
                }
                className="w-5 h-5"
              />

              <span className="font-medium">
                Enable Affiliate Commission
              </span>
            </label>

            {affiliateEnabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Affiliate Commission
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={affiliateCommission}
                  onChange={(e) =>
                    setAffiliateCommission(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-lg px-4 py-3"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default EditProductForm;