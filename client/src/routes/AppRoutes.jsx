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
import Checkout from "../pages/Checkout";
import HealthResourceCenter from "../pages/HealthResourceCenter";
import HairCare from "../pages/HairCare";
import SexualWellness from "../pages/SexualWellness";
import FitnessHealth from "../pages/FitnessHealth";
import VitaminsNutrition from "../pages/VitaminsNutrition";
import SupportsBraces from "../pages/SupportsBraces";
import ImmunityBoosters from "../pages/ImmunityBoosters";
import Homeopathy from "../pages/Homeopathy";
import PetCare from "../pages/PateCare";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        {/* <Route path="/categories" element={<Categories />} /> */}
        {/* <Route path="/shop/:categorySlug" element={<CategoryLanding />} /> */}
        {/* <Route path="/shop/:categorySlug/:subSlug" element={<SubcategoryPage />} /> */}
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
        <Route path="/pet-care" element={<PetCare />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
