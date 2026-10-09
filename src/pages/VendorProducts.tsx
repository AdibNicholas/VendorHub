import CreateProductForm from "../components/vendor/CreateProductForm";
import ProductList from "../components/vendor/ProductList";

function VendorProducts() {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <p className="text-emerald-600 font-semibold">
          Vendor Management
        </p>

        <h1 className="text-4xl font-bold mt-1">
          Manage Products
        </h1>

        <p className="text-gray-500 mt-2">
          Add, edit, organize, and manage products
          across your stores.
        </p>
      </div>

      {/* ADD PRODUCT */}
      <div className="mb-10">
        <CreateProductForm />
      </div>

      {/* PRODUCT MANAGEMENT */}
      <ProductList />
    </div>
  );
}

export default VendorProducts;