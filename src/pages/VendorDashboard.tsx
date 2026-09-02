import CreateStoreForm from "../components/vendor/CreateStoreForm";
import StoreList from "../components/vendor/StoreList";
import VendorStats from "../components/vendor/VendorStats";
import CreateProductForm from "../components/vendor/CreateProductForm";
import ProductList from "../components/vendor/ProductList";
import VendorOrders from "../components/vendor/VendorOrders";

function VendorDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-emerald-600 mb-8">
        Vendor Dashboard
      </h1>

      <VendorStats />

      <div className="mt-10">
        <CreateStoreForm />
      </div>

      <div className="mt-10">
        <StoreList />
      </div>

      <div className="mt-10">
        <CreateProductForm />
      </div>
      <div className="mt-10">
  <ProductList />
  <VendorOrders />
</div>
    </div>
  );
}

export default VendorDashboard;