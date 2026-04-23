import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const MainLayout = lazy(() => import("../components/layout/MainLayout"));
const Home = lazy(() => import("../pages/Home"));
const Products = lazy(() => import("../pages/Products"));
const ProductDetails = lazy(() => import("../pages/ProductDetails"));
const Categories = lazy(() => import("../pages/Categories"));
const CategoryLanding = lazy(() => import("../pages/CategoryLanding"));
const SubcategoryPage = lazy(() => import("../pages/SubcategoryPage"));
const PrescriptionUpload = lazy(() => import("../pages/PrescriptionUpload"));
const Offers = lazy(() => import("../pages/Offers"));
const Contact = lazy(() => import("../pages/Contact"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Cart = lazy(() => import("../pages/Cart"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Checkout = lazy(() => import("../pages/Checkout"));
const Payment = lazy(() => import("../pages/Payment"));
const HealthResourceCenter = lazy(() => import("../pages/HealthResourceCenter"));
const HairCare = lazy(() => import("../pages/HairCare"));
const SexualWellness = lazy(() => import("../pages/SexualWellness"));
const FitnessHealth = lazy(() => import("../pages/FitnessHealth"));
const VitaminsNutrition = lazy(() => import("../pages/VitaminsNutrition"));
const SupportsBraces = lazy(() => import("../pages/SupportsBraces"));
const ImmunityBoosters = lazy(() => import("../pages/ImmunityBoosters"));
const Homeopathy = lazy(() => import("../pages/Homeopathy"));
const PateCare = lazy(() => import("../pages/PateCare"));
const AdminLayout = lazy(() => import("../components/admin/AdminLayout"));
const ProtectedAdminRoute = lazy(() => import("../components/admin/ProtectedAdminRoute"));
const DashboardPage = lazy(() => import("../pages/admin/DashboardPage"));
const ProductsPage = lazy(() => import("../pages/admin/ProductsPage"));
const OrdersPage = lazy(() => import("../pages/admin/OrdersPage"));
const CustomersPage = lazy(() => import("../pages/admin/CustomersPage"));
const PrescriptionsPage = lazy(() => import("../pages/admin/PrescriptionsPage"));
const UserDashboard = lazy(() => import("../pages/UserDashboard"));
const MrRequestsPage = lazy(() => import("../pages/admin/MrRequestsPage"));
const MrProductRequestsPage = lazy(() => import("../pages/admin/MrProductRequestsPage"));
const PrivacyPolicy = lazy(() => import("../pages/footer/PrivacyPolicy"));
const ShippingPolicy = lazy(() => import("../pages/footer/ShippingPolicy"));
const ReturnPolicy = lazy(() => import("../pages/footer/ReturnPolicy"));
const About = lazy(() => import("../pages/footer/About"));
const TermsConditions = lazy(() => import("../pages/footer/TermsConditions"));
const Reminder = lazy(() => import("../pages/Reminder"));
const Returns = lazy(() => import("../pages/Returns"));
const OrderDetails = lazy(() => import("../pages/OrderDetails"));
const MrDashboard = lazy(() => import("../pages/MR/MrProduct"));
const ProtectedRoleRoute = lazy(() => import("../components/common/ProtectedRoleRoute"));
const ReturnsPage = lazy(() => import("../pages/admin/ReturnsPage"));
const UserBanksPage = lazy(() => import("../pages/admin/UserBanksPage"));

const RouteLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-white text-sm font-medium text-slate-500">
    Loading...
  </div>
);


const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
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
          <Route path="/return-policy" element={<ReturnPolicy />} />
          <Route path="/about" element={<About />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/terms-and-conditions" element={<TermsConditions />} />
          <Route path="*" element={<NotFound />} />

        </Route>

        <Route element={<ProtectedRoleRoute allowedRoles={["user", "admin", "mr"]} />}>
          <Route element={<MainLayout />}>
            <Route path="/reminder" element={<Reminder />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoleRoute allowedRoles={["user"]} />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route element={<MainLayout />}>
            <Route path="/returns" element={<Returns />} />
            <Route path="/order-details/:id" element={<OrderDetails />} />
          </Route>
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
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="user-banks" element={<UserBanksPage />} />
            {/* <Route path="inventory" element={<InventoryPage />} /> */}
            <Route path="customers" element={<CustomersPage />} />
            <Route path="mr-requests" element={<MrRequestsPage />} />
            <Route path="mr-products" element={<MrProductRequestsPage />} />
            <Route path="prescriptions" element={<PrescriptionsPage />} />
            <Route path="user-dashboard" element={<UserDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
