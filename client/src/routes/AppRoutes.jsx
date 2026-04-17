import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Categories from "../pages/Categories";
import CategoryLanding from "../pages/CategoryLanding";
import SubcategoryPage from "../pages/SubcategoryPage";
import PrescriptionUpload from "../pages/PrescriptionUpload";
import Offers from "../pages/Offers";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Cart from "../pages/Cart";
import NotFound from "../pages/NotFound";
import Checkout from "../pages/Checkout";
import Payment from "../pages/Payment";
import HealthResourceCenter from "../pages/HealthResourceCenter";
import HairCare from "../pages/HairCare";
import SexualWellness from "../pages/SexualWellness";
import FitnessHealth from "../pages/FitnessHealth";
import VitaminsNutrition from "../pages/VitaminsNutrition";
import SupportsBraces from "../pages/SupportsBraces";
import ImmunityBoosters from "../pages/ImmunityBoosters";
import Homeopathy from "../pages/Homeopathy";
import PateCare from "../pages/PateCare";
import AdminLayout from "../components/admin/AdminLayout";
import ProtectedAdminRoute from "../components/admin/ProtectedAdminRoute";
import DashboardPage from "../pages/admin/DashboardPage";
import ProductsPage from "../pages/admin/ProductsPage";
import OrdersPage from "../pages/admin/OrdersPage";
// import InventoryPage from "../pages/admin/InventoryPage";
import CustomersPage from "../pages/admin/CustomersPage";
import PrescriptionsPage from "../pages/admin/PrescriptionsPage";
import UserDashboard from "../pages/UserDashboard";
import MrRequestsPage from "../pages/admin/MrRequestsPage";
import MrProductRequestsPage from "../pages/admin/MrProductRequestsPage";
import PrivacyPolicy from "../pages/footer/PrivacyPolicy";
import ShippingPolicy from "../pages/footer/ShippingPolicy";
import ReturnPolicy from "../pages/footer/ReturnPolicy";
import About from "../pages/footer/About";
import TermsConditions from "../pages/footer/TermsConditions";

import MrDashboard from "../pages/MR/MrProduct";
import ProtectedRoleRoute from "../components/common/ProtectedRoleRoute";


const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/shop/:categorySlug" element={<CategoryLanding />} />
        <Route path="/shop/:categorySlug/:subSlug" element={<SubcategoryPage />} />
        <Route path="/upload-prescription" element={<PrescriptionUpload />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/health-resource-center" element={<HealthResourceCenter />} />
        <Route path="/hair-care" element={<HairCare />} />
        <Route path="/fitness-health" element={<FitnessHealth />} />
        <Route path="/sexual-wellness" element={<SexualWellness />} />
        <Route path="/vitamins-nutrition" element={<VitaminsNutrition />} />
        <Route path="/supports-braces" element={<SupportsBraces />} />
        <Route path="/immunity-boosters" element={<ImmunityBoosters />} />
        <Route path="/homeopathy" element={<Homeopathy />} />
        <Route path="/pet-care" element={<PateCare />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/shipping" element={<ShippingPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/returns" element={<ReturnPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/about" element={<About />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="*" element={<NotFound />} />

      </Route>

      <Route element={<ProtectedRoleRoute allowedRoles={["user"]} />}>
        <Route path="/user-dashboard" element={<UserDashboard />} />
      </Route>

      <Route element={<ProtectedRoleRoute allowedRoles={["mr"]} />}>
        <Route path="/mr-dashboard" element={<MrDashboard />} />
      </Route>

      <Route path="/admin" element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>

          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          {/* <Route path="inventory" element={<InventoryPage />} /> */}
          <Route path="customers" element={<CustomersPage />} />
          <Route path="mr-requests" element={<MrRequestsPage />} />
          <Route path="mr-products" element={<MrProductRequestsPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="user-dashboard" element={<UserDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
