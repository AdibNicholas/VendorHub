import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { PRODUCT_CATEGORIES } from "../../constants/categories";

interface Store {
  id: string;
  name: string;
}

interface CreateProductFormProps {
  onProductCreated?: () => void;
}

function CreateProductForm({
  onProductCreated,
}: CreateProductFormProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [saving, setSaving] = useState(false);

  const [storeId, setStoreId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [affiliateEnabled, setAffiliateEnabled] = useState(false);
  const [affiliateCommission, setAffiliateCommission] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  // -----------------------------------------
  // LOAD VENDOR STORES
  // -----------------------------------------

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

      if (data && data.length > 0) {
        setStoreId(data[0].id);
      }
    }

    setLoadingStores(false);
  };

  // -----------------------------------------
  // RESET FORM
  // -----------------------------------------

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategory("");
    setImageUrl("");
    setAffiliateEnabled(false);
    setAffiliateCommission("");

    if (stores.length > 0) {
      setStoreId(stores[0].id);
    } else {
      setStoreId("");
    }
  };

  // -----------------------------------------
  // CREATE PRODUCT
  // -----------------------------------------

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

    if (!category) {
      alert("Please select a category.");
      return;
    }

    if (
      affiliateEnabled &&
      (!affiliateCommission ||
        Number(affiliateCommission) < 0)
    ) {
      alert(
        "Please enter a valid affiliate commission."
      );
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("products")
      .insert({
        store_id: storeId,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        category,
        image_url: imageUrl.trim() || null,
        affiliate_enabled: affiliateEnabled,
        affiliate_commission: affiliateEnabled
          ? Number(affiliateCommission)
          : 0,
        is_active: true,
      });

    if (error) {
      console.error(
        "Error creating product:",
        error
      );

      alert(
        `Unable to create product: ${error.message}`
      );

      setSaving(false);
      return;
    }

    alert("Product created successfully!");

    resetForm();

    if (onProductCreated) {
      onProductCreated();
    }

    setSaving(false);
  };

  // -----------------------------------------
  // PAGE
  // -----------------------------------------

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <div className="mb-6">
        <p className="text-emerald-600 font-semibold text-sm">
          Product Management
        </p>

        <h2 className="text-2xl font-bold mt-1">
          Add New Product
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Add a product to one of your VendorHub stores.
        </p>
      </div>

      {loadingStores ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-500">
            Loading your stores...
          </p>
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">
            You need to create a store before adding
            products.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* STORE */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Store
            </label>

            <select
              value={storeId}
              onChange={(e) =>
                setStoreId(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

            <p className="text-xs text-gray-500 mt-2">
              You can select any store belonging to
              your VendorHub account.
            </p>
          </div>

          {/* PRODUCT NAME */}
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
              placeholder="e.g. Samsung Galaxy S25"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe your product"
              rows={4}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* PRICE + STOCK */}
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
                placeholder="0.00"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                placeholder="0"
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full border rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">
                Select a category
              </option>

              {PRODUCT_CATEGORIES.map(
                (categoryOption) => (
                  <option
                    key={categoryOption}
                    value={categoryOption}
                  >
                    {categoryOption}
                  </option>
                )
              )}
            </select>
          </div>

          {/* IMAGE URL */}
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
              placeholder="https://example.com/product.jpg"
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <p className="text-xs text-gray-500 mt-2">
              Add a publicly accessible image URL for
              the product.
            </p>
          </div>

          {/* AFFILIATE */}
          <div className="border rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={affiliateEnabled}
                onChange={(e) =>
                  setAffiliateEnabled(
                    e.target.checked
                  )
                }
                className="w-5 h-5"
              />

              <span className="font-medium">
                Enable Affiliate Commission
              </span>
            </label>

            <p className="text-sm text-gray-500 mt-2">
              Allow approved VendorHub marketers to
              promote this product.
            </p>

            {affiliateEnabled && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Affiliate Commission (%)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max="100"
                  value={affiliateCommission}
                  onChange={(e) =>
                    setAffiliateCommission(
                      e.target.value
                    )
                  }
                  placeholder="e.g. 10"
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Enter the percentage the marketer
                  earns when this product is sold through
                  their affiliate link.
                </p>
              </div>
            )}
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? "Creating Product..."
              : "Create Product"}
          </button>
        </form>
      )}
    </div>
  );
}

export default CreateProductForm;