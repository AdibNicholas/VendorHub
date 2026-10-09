import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import Home from "../pages/Home";
import Shop from "../pages/Shop";
import Vendors from "../pages/Vendors";
import Marketers from "../pages/Marketers";
import Contacts from "../pages/Contacts";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CustomerDashboard from "../pages/CustomerDashboard";
import VendorDashboard from "../pages/VendorDashboard";
import MarketerDashboard from "../pages/MarketerDashboard";
import DeliveryDashboard from "../pages/DeliveryDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ManageStore from "../pages/ManageStore";
import StorePage from "../pages/StorePage";
import ProductPage from "../pages/ProductPage";
import CartPage from "../pages/CartPage";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/OrderSuccess";
import Account from "../pages/Account";
import Orders from "../pages/Orders";
import VendorOrders from "../pages/VendorOrders";
import VendorProducts from "../pages/VendorProducts";
import AdminUsers from "../pages/AdminUsers";
import AdminVendors from "../pages/AdminVendors";
import AdminVendorDetails from "../pages/AdminVendorDetails";
import AdminProducts from "../pages/AdminProducts";
import AdminOrders from "../pages/AdminOrders";
import Support from "../pages/Support";
import AdminSupport from "../pages/AdminSupport";
import AdminMarketers from "../pages/AdminMarketers";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/vendors" element={<Vendors />} />
      <Route path="/marketers" element={<Marketers />} />
      <Route path="/contact" element={<Contacts />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/store/:id" element={<StorePage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      
     <Route
  path="/customer"
  element={
    <ProtectedRoute allowedRole="customer">
      <CustomerDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/support"
  element={
    <ProtectedRoute allowedRole="customer">
      <Support />
    </ProtectedRoute>
  }
/>

<Route
  path="/vendor"
  element={
    <ProtectedRoute allowedRole="vendor">
      <VendorDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/vendor/products"
  element={
    <ProtectedRoute allowedRole="vendor">
      <VendorProducts />
    </ProtectedRoute>
  }
/>
<Route
  path="/vendor/orders"
  element={
    <ProtectedRoute allowedRole="vendor">
      <VendorOrders />
    </ProtectedRoute>
  }
/>

<Route
  path="/marketer"
  element={
    <ProtectedRoute allowedRole="marketer">
      <MarketerDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/delivery"
  element={
    <ProtectedRoute allowedRole="delivery">
      <DeliveryDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminUsers />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/vendors"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminVendors />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/marketers"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminMarketers />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/vendors/:id"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminVendorDetails />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/products"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminProducts />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/orders"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminOrders />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin/support"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminSupport />
    </ProtectedRoute>
  }
/>
<Route path="/vendor/store/:id" element={
  <ProtectedRoute allowedRole="vendor">
    <ManageStore />
  </ProtectedRoute>
} />
<Route
  path="/checkout"
  element={<Checkout />}
/>
<Route
  path="/order-success/:id"
  element={<OrderSuccess />}
/>
<Route
  path="/orders"
  element={<Orders />}
/>
<Route
  path="/account"
  element={<Account />}
/>

    </Routes>
  );
}

export default AppRoutes;