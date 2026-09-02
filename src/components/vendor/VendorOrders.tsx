import VendorOrderList from "./VendorOrderList";

function VendorOrders() {
  return (
    <div className="mt-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Customer Orders
        </h2>

        <p className="text-gray-500 mt-1">
          Manage orders containing products from your stores.
        </p>
      </div>

      <VendorOrderList />
    </div>
  );
}

export default VendorOrders;