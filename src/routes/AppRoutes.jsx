import { Routes, Route } from "react-router-dom";
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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
