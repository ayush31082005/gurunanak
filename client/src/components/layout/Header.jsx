import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  Search,
  User,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { categoryMenu } from "../../data/categories";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDesktopMenu, setActiveDesktopMenu] = useState(null);
  const [activeTabletMenu, setActiveTabletMenu] = useState(null);
  const [activeMobileCategory, setActiveMobileCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("New Delhi");
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const locationMenuRef = useRef(null);

  const cityOptions = [
    "New Delhi",
    "Mumbai",
    "Bengaluru",
    "Hyderabad",
    "Chandigarh",
    "Jaipur",
  ];

  useEffect(() => {
    setActiveDesktopMenu(null);
    setActiveTabletMenu(null);
    setActiveMobileCategory(null);
    setMobileMenuOpen(false);
    setLocationMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const activeSearch = params.get("search") || "";

    if (location.pathname === "/products") {
      setSearchQuery(activeSearch);
      return;
    }

    setSearchQuery("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!locationMenuRef.current?.contains(event.target)) {
        setLocationMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const activeTabletCategory = categoryMenu.find(
    (item) => item.slug === activeTabletMenu
  );

  const getDesktopDropdownPosition = (index) => {
    if (index >= categoryMenu.length - 2) {
      return "right-0";
    }

    return "left-0";
  };

  const getCategoryPath = (slug) => {
    if (slug === "health-resource-center") {
      return "/health-resource-center";
    }

    if (slug === "hair-care") {
      return "/hair-care";
    }

    if (slug === "fitness-health") {
      return "/fitness-health";
    }

    if (slug === "sexual-wellness") {
      return "/sexual-wellness";
    }

    if (slug === "vitamins-nutrition") {
      return "/vitamins-nutrition";
    }

    if (slug === "supports-braces") {
      return "/supports-braces";
    }

    if (slug === "immunity-boosters") {
      return "/immunity-boosters";
    }

    if (slug === "homeopathy") {
      return "/homeopathy";
    }

    if (slug === "pet-care") {
      return "/pet-care";
    }

    return `/shop/${slug}`;
  };

  const getSubcategoryPath = (categorySlug, link) => {
    if (categorySlug === "health-resource-center") {
      return `/health-resource-center?filter=${encodeURIComponent(link.label)}`;
    }

    if (categorySlug === "hair-care") {
      return `/hair-care?filter=${encodeURIComponent(link.label)}`;
    }

    if (categorySlug === "fitness-health") {
      return `/fitness-health?filter=${encodeURIComponent(link.label)}`;
    }

    if (categorySlug === "sexual-wellness") {
      return `/sexual-wellness?filter=${encodeURIComponent(link.label)}`;
    }

    if (categorySlug === "vitamins-nutrition") {
      return `/vitamins-nutrition?filter=${encodeURIComponent(link.label)}`;
    }

    if (categorySlug === "supports-braces") {
      return `/supports-braces?filter=${encodeURIComponent(link.label)}`;
    }

    if (categorySlug === "immunity-boosters") {
      return `/immunity-boosters?filter=${encodeURIComponent(link.label)}`;
    }

    if (categorySlug === "homeopathy") {
      return `/homeopathy?filter=${encodeURIComponent(link.label)}`;
    }

    if (categorySlug === "pet-care") {
      return `/pet-care?filter=${encodeURIComponent(link.label)}`;
    }

    return `/shop/${categorySlug}/${link.slug}`;
  };

  const renderDropdownContent = (category, closeMenu, compact = false) => (
    <div
      className={`rounded-[20px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div
        className={`grid gap-5 ${
          category.sections.length > 1 ? "md:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {category.sections.map((section, sectionIndex) => (
          <div key={`${category.slug}-${sectionIndex}`}>
            {section.title ? (
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {section.title}
              </p>
            ) : null}

            <div className="space-y-1">
              {section.links.map((link) => (
                <Link
                  key={link.slug}
                  to={getSubcategoryPath(category.slug, link)}
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-orange-50 hover:text-orange-600"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      navigate("/products");
      return;
    }

    navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setLocationMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[100] w-full border-b border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-4 lg:px-6">
        <div className="flex min-h-[64px] items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <h1 className="text-[20px] font-extrabold leading-none text-slate-800 sm:text-[22px]">
                GURUNANAK
              </h1>
            </Link>

            <div ref={locationMenuRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setLocationMenuOpen((prev) => !prev)}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 transition hover:text-[#ff6f61]"
              >
                <MapPin size={16} className="text-orange-500" />
                <span className="max-w-[90px] truncate lg:max-w-none">{selectedCity}</span>
                <ChevronDown
                  size={14}
                  className={`text-gray-500 transition ${locationMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {locationMenuOpen ? (
                <div className="absolute left-0 top-full z-[110] mt-3 min-w-[180px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                  {cityOptions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                        selectedCity === city
                          ? "bg-orange-50 text-[#ff6f61]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="hidden flex-1 justify-center md:flex">
            <form
              onSubmit={handleSearchSubmit}
              className="mx-2 flex h-[40px] w-full max-w-[420px] items-center rounded-full border border-gray-200 bg-[#f8f8fb] px-4 lg:max-w-[520px] xl:max-w-[620px]"
            >
              <button type="submit" className="shrink-0 text-gray-400 transition hover:text-[#ff6f61]">
                <Search size={18} />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search medicines, wellness products and more..."
                className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </form>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-5">
            <Link
              to="/login"
              className="hidden items-center gap-1 text-sm font-medium text-gray-700 hover:text-black lg:flex"
            >
              <User size={16} />
              <span>Login</span>
            </Link>

            <Link
              to="/register"
              className="hidden items-center gap-1 text-sm font-medium text-gray-700 hover:text-black lg:flex"
            >
              <User size={16} />
              <span>Register</span>
            </Link>

            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-slate-700 sm:h-auto sm:w-auto sm:border-0 sm:p-0 sm:text-sm sm:font-medium"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline sm:ml-1">Cart</span>
              <span className="absolute right-0 top-0 flex h-4 min-w-4 -translate-y-1/3 translate-x-1/3 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white sm:-right-2 sm:-top-2 sm:translate-x-0 sm:translate-y-0">
                {cartCount}
              </span>
            </Link>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-slate-700 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link
              to="/upload-prescription"
              className="hidden rounded-full bg-[#ff6f61] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#f45d4f] sm:block lg:px-5 lg:py-2.5"
            >
              Quick Order
            </Link>
          </div>
        </div>

        <div className="pb-2 md:hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="flex h-[40px] w-full items-center rounded-full border border-gray-200 bg-[#f8f8fb] px-4"
          >
            <button type="submit" className="shrink-0 text-gray-400 transition hover:text-[#ff6f61]">
              <Search size={18} />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search medicines, wellness products..."
              className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </form>
        </div>
      </div>

      <div className="hidden border-t border-gray-100 lg:block">
        <div className="mx-auto flex max-w-[1280px] items-center gap-2 px-4 py-1.5 xl:px-6">
          {categoryMenu.map((item, index) => (
            <div
              key={item.slug}
              className="relative"
              onMouseEnter={() => setActiveDesktopMenu(item.slug)}
              onMouseLeave={() => setActiveDesktopMenu(null)}
            >
              <Link
                to={getCategoryPath(item.slug)}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 whitespace-nowrap text-[11px] font-medium transition xl:text-[12px] ${
                  activeDesktopMenu === item.slug
                    ? "text-orange-600"
                    : "text-slate-700 hover:text-black"
                }`}
              >
                <span>{item.label}</span>
                <ChevronDown
                  size={11}
                  className={`transition ${
                    activeDesktopMenu === item.slug
                      ? "rotate-180 text-orange-500"
                      : "text-slate-500"
                  }`}
                />
              </Link>

              {activeDesktopMenu === item.slug ? (
                <div
                  className={`absolute top-full z-50 pt-3 ${getDesktopDropdownPosition(
                    index
                  )}`}
                >
                  <div className="w-max min-w-[250px] max-w-[520px]">
                    {renderDropdownContent(item, () => setActiveDesktopMenu(null))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="hidden border-t border-gray-100 md:block lg:hidden">
        <div className="mx-auto max-w-[1280px] px-4">
          <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
            {categoryMenu.map((item) => (
              <button
                key={item.slug}
                onClick={() =>
                  setActiveTabletMenu((currentMenu) =>
                    currentMenu === item.slug ? null : item.slug
                  )
                }
                className={`flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-medium transition ${
                  activeTabletMenu === item.slug
                    ? "text-orange-600"
                    : "text-slate-700"
                }`}
              >
                <span>{item.label}</span>
                <ChevronDown
                  size={11}
                  className={`transition ${
                    activeTabletMenu === item.slug
                      ? "rotate-180 text-orange-500"
                      : "text-slate-500"
                  }`}
                />
              </button>
            ))}
          </div>

          {activeTabletCategory ? (
            <div className="border-t border-gray-100 pb-4 pt-3">
              {renderDropdownContent(
                activeTabletCategory,
                () => setActiveTabletMenu(null),
                true
              )}
            </div>
          ) : null}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-gray-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] lg:hidden">
          <div className="mx-auto max-h-[calc(100vh-88px)] max-w-[1280px] overflow-y-auto px-4 py-4">
            <div className="mb-4 rounded-2xl border border-slate-200 p-2 md:hidden">
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Select City
              </p>
              <div className="grid grid-cols-2 gap-2">
                {cityOptions.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      selectedCity === city
                        ? "bg-orange-50 text-[#ff6f61]"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <MapPin size={14} className="text-orange-500" />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-slate-700"
              >
                <User size={16} />
                <span>Login</span>
              </Link>

              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-slate-700"
              >
                <User size={16} />
                <span>Register</span>
              </Link>

              <Link
                to="/upload-prescription"
                onClick={() => setMobileMenuOpen(false)}
                className="col-span-2 rounded-lg bg-[#ff6f61] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#f45d4f] sm:col-span-1"
              >
                Quick Order
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {categoryMenu.map((item) => (
                <div
                  key={item.slug}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white"
                >
                  <button
                    onClick={() =>
                      setActiveMobileCategory((currentCategory) =>
                        currentCategory === item.slug ? null : item.slug
                      )
                    }
                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition ${
                      activeMobileCategory === item.slug
                        ? "bg-orange-50 text-orange-600"
                        : "text-slate-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transition ${
                        activeMobileCategory === item.slug
                          ? "rotate-180 text-orange-500"
                          : "text-slate-500"
                      }`}
                    />
                  </button>

                  {activeMobileCategory === item.slug ? (
                    <div className="border-t border-gray-100 bg-white p-2">
                      <Link
                        to={getCategoryPath(item.slug)}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                      >
                        View all {item.label}
                      </Link>

                      {item.sections.map((section, sectionIndex) => (
                        <div key={`${item.slug}-mobile-${sectionIndex}`} className="mt-1">
                          {section.title ? (
                            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                              {section.title}
                            </p>
                          ) : null}

                          {section.links.map((link) => (
                            <Link
                              key={link.slug}
                              to={getSubcategoryPath(item.slug, link)}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
