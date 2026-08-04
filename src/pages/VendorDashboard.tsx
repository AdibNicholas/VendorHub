import CreateStoreForm from "../components/vendor/CreateStoreForm";
import StoreList from "../components/vendor/StoreList";
import VendorStats from "../components/vendor/VendorStats";

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
    </div>
  );
}

export default VendorDashboard;