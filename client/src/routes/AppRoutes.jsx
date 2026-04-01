import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/Home";
import Products from "../pages/Products";
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


const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
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
        <Route path="/health-resource-center" element={<HealthResourceCenter />} />
        <Route path="/hair-care" element={<HairCare />} />
        <Route path="/fitness-health" element={<FitnessHealth />} />
        <Route path="/sexual-wellness" element={<SexualWellness />} />
        <Route path="/vitamins-nutrition" element={<VitaminsNutrition />} />
        <Route path="/supports-braces" element={<SupportsBraces />} />
        <Route path="/immunity-boosters" element={<ImmunityBoosters />} />
        <Route path="/homeopathy" element={<Homeopathy />} />
        <Route path="/pet-care" element={<PateCare />} />
        <Route path="*" element={<NotFound />} />

      </Route>

      <Route path="/admin" element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>

          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          {/* <Route path="inventory" element={<InventoryPage />} /> */}
          <Route path="customers" element={<CustomersPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />

        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
