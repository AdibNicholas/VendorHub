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
     <Route
  path="/customer"
  element={
    <ProtectedRoute allowedRole="customer">
      <CustomerDashboard />
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
  path="/store/:id"
  element={
    <ProtectedRoute allowedRole="vendor">
      <ManageStore />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}

export default AppRoutes;