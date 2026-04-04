import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  Search,
  User,
  ShoppingCart,
  ChevronDown,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { categoryMenu } from "../../data/categories";

const USER_CITY_STORAGE_KEY = "userCity";
const CHECKOUT_ADDRESS_STORAGE_KEY = "checkoutAddress";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDesktopMenu, setActiveDesktopMenu] = useState(null);
  const [activeTabletMenu, setActiveTabletMenu] = useState(null);
  const [activeMobileCategory, setActiveMobileCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Select City");
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const cityOptions = [
    "New Delhi",
    "Mumbai",
    "Bengaluru",
    "Hyderabad",
    "Chandigarh",
    "Jaipur",
  ];

  const getDisplayName = (user) => {
    const rawName =
      user?.name ||
      user?.fullName ||
      user?.username ||
      user?.userName ||
      user?.email?.split("@")[0] ||
      "";

    if (!rawName) {
      return "User";
    }

    return rawName
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getNormalizedRole = (user) =>
    typeof user?.role === "string" ? user.role.trim().toLowerCase() : "";

  const syncSelectedCity = () => {
    const savedCity = localStorage.getItem(USER_CITY_STORAGE_KEY);

    if (savedCity) {
      setSelectedCity(savedCity);
      return;
    }

    try {
      const storedAddress = localStorage.getItem(CHECKOUT_ADDRESS_STORAGE_KEY);
      if (storedAddress) {
        const parsedAddress = JSON.parse(storedAddress);
        if (parsedAddress?.city) {
          setSelectedCity(parsedAddress.city);
          return;
        }
      }
    } catch {
      // ignore
    }

    setSelectedCity("Select City");
  };

  useEffect(() => {
    setActiveDesktopMenu(null);
    setActiveTabletMenu(null);
    setActiveMobileCategory(null);
    setMobileMenuOpen(false);
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
    const updateAuthState = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      setIsLoggedIn(!!token);

      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          setUserName(getDisplayName(parsedUser));
          setUserRole(getNormalizedRole(parsedUser));
        } catch (error) {
          setUserName("User");
          setUserRole("");
        }
      } else {
        setUserName("");
        setUserRole("");
      }
    };

    updateAuthState();
    window.addEventListener("storage", updateAuthState);
    window.addEventListener("authchange", updateAuthState);

    return () => {
      window.removeEventListener("storage", updateAuthState);
      window.removeEventListener("authchange", updateAuthState);
    };
  }, []);

  useEffect(() => {
    syncSelectedCity();

    const handleCityChange = () => {
      syncSelectedCity();
    };

    window.addEventListener("storage", handleCityChange);
    window.addEventListener("citychange", handleCityChange);
    window.addEventListener("profiledatachange", handleCityChange);

    return () => {
      window.removeEventListener("storage", handleCityChange);
      window.removeEventListener("citychange", handleCityChange);
      window.removeEventListener("profiledatachange", handleCityChange);
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
    if (slug === "health-resource-center") return "/health-resource-center";
    if (slug === "hair-care") return "/hair-care";
    if (slug === "fitness-health") return "/fitness-health";
    if (slug === "sexual-wellness") return "/sexual-wellness";
    if (slug === "vitamins-nutrition") return "/vitamins-nutrition";
    if (slug === "supports-braces") return "/supports-braces";
    if (slug === "immunity-boosters") return "/immunity-boosters";
    if (slug === "homeopathy") return "/homeopathy";
    if (slug === "pet-care") return "/pet-care";

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
      className={`rounded-[20px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] ${compact ? "p-4" : "p-5"
        }`}
    >
      <div
        className={`grid gap-5 ${category.sections.length > 1 ? "md:grid-cols-2" : "grid-cols-1"
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
    localStorage.setItem(USER_CITY_STORAGE_KEY, city);
    window.dispatchEvent(new Event("citychange"));
  };

  const handleCartClick = (event) => {
    const token = localStorage.getItem("token");

    if (token) return;

    event.preventDefault();
    navigate("/login");
  };

  const handleQuickOrderClick = (event) => {
    const token = localStorage.getItem("token");

    if (token) return;

    event.preventDefault();
    navigate("/login", {
      state: {
        message: "Please login first to continue with quick order.",
        redirectTo: "/upload-prescription",
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authchange"));
    setMobileMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const accountPath = userRole === "admin" ? "/admin/dashboard" : "/user-dashboard";

  return (
    <header className="fixed inset-x-0 top-0 z-[100] w-full border-b border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-4 lg:px-6">
        <div className="flex min-h-[64px] items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <h1 className="text-[20px] font-extrabold leading-none text-slate-800 sm:text-[22px]">
                𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘
              </h1>
            </Link>

            <div className="hidden md:block">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <MapPin size={16} className="text-orange-500" />
                <span className="max-w-[110px] truncate lg:max-w-none">
                  {selectedCity}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden flex-1 justify-center md:flex">
            <form
              onSubmit={handleSearchSubmit}
              className="mx-2 flex h-[40px] w-full max-w-[420px] items-center rounded-full border border-gray-200 bg-[#f8f8fb] px-4 lg:max-w-[520px] xl:max-w-[620px]"
            >
              <button
                type="submit"
                className="shrink-0 text-gray-400 transition hover:text-[#ff6f61]"
              >
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
            {!isLoggedIn ? (
              <>
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
              </>
            ) : (
              <Link
                to={accountPath}
                className="hidden items-center gap-2 text-sm font-medium text-gray-700 hover:text-black lg:flex"
              >
                <User size={16} />
                <span className="max-w-[120px] truncate">{userName || "User"}</span>
              </Link>
            )}

            <Link
              to="/cart"
              onClick={handleCartClick}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-slate-700 sm:h-auto sm:w-auto sm:border-0 sm:p-0 sm:text-sm sm:font-medium"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline sm:ml-1">Cart</span>
              {isLoggedIn ? (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 -translate-y-1/3 translate-x-1/3 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white sm:-right-2 sm:-top-2 sm:translate-x-0 sm:translate-y-0">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <Link
              to="/upload-prescription"
              onClick={handleQuickOrderClick}
              className="hidden rounded-full bg-[#ff6f61] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#f45d4f] sm:block lg:px-5 lg:py-2.5"
            >
              Quick Order
            </Link>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-slate-700 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className="pb-2 md:hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="flex h-[40px] w-full items-center rounded-full border border-gray-200 bg-[#f8f8fb] px-4"
          >
            <button
              type="submit"
              className="shrink-0 text-gray-400 transition hover:text-[#ff6f61]"
            >
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
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 whitespace-nowrap text-[11px] font-medium transition xl:text-[12px] ${activeDesktopMenu === item.slug
                  ? "text-orange-600"
                  : "text-slate-700 hover:text-black"
                  }`}
              >
                <span>{item.label}</span>
                <ChevronDown
                  size={11}
                  className={`transition ${activeDesktopMenu === item.slug
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
                className={`flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-medium transition ${activeTabletMenu === item.slug
                  ? "text-orange-600"
                  : "text-slate-700"
                  }`}
              >
                <span>{item.label}</span>
                <ChevronDown
                  size={11}
                  className={`transition ${activeTabletMenu === item.slug
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

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close mobile menu overlay"
          />

          <aside className="absolute left-0 top-0 flex h-full w-[306px] max-w-[88vw] flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900 shadow-[12px_0_40px_rgba(15,23,42,0.18)]">
            <div className="flex h-20 items-center justify-between border-b border-slate-200 px-4">
              <div>
                <h2 className="text-[22px] font-extrabold tracking-tight text-slate-900">
                  GURUNANAK
                </h2>
                <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                  Menu
                </p>
              </div>

              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close mobile menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-200 px-1 pb-4 text-sm text-slate-700">
                <MapPin size={16} className="text-[#ff6f61]" />
                <span className="truncate">{selectedCity}</span>
              </div>

              <div className="space-y-1.5">
                {categoryMenu.map((item) => (
                  <div key={item.slug} className="border-b border-slate-100 pb-1.5">
                    <button
                      onClick={() =>
                        setActiveMobileCategory((currentCategory) =>
                          currentCategory === item.slug ? null : item.slug
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-[6px] border px-4 py-3 text-left text-[15px] font-medium transition ${
                        activeMobileCategory === item.slug
                          ? "border-[#ffb36c] bg-[#fff7f2] text-slate-900"
                          : "border-transparent text-slate-800 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={15}
                        className={`transition ${
                          activeMobileCategory === item.slug
                            ? "rotate-180 text-slate-700"
                            : "text-slate-400"
                        }`}
                      />
                    </button>

                    {activeMobileCategory === item.slug ? (
                      <div className="px-2 pb-2 pt-2">
                        <Link
                          to={getCategoryPath(item.slug)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                        >
                          View all {item.label}
                        </Link>

                        {item.sections.map((section, sectionIndex) => (
                          <div key={`${item.slug}-mobile-${sectionIndex}`} className="mt-2">
                            {section.title ? (
                              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {section.title}
                              </p>
                            ) : null}

                            {section.links.map((link) => (
                              <Link
                                key={link.slug}
                                to={getSubcategoryPath(item.slug, link)}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block rounded-md px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
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

            <div className="border-t border-slate-200 px-3 py-4">
              {!isLoggedIn ? (
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                  >
                    <User size={16} />
                    <span>Login</span>
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                  >
                    <User size={16} />
                    <span>Register</span>
                  </Link>
                </div>
              ) : (
                <div className="mb-3 flex items-center gap-3 px-2 pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-900">
                    {(userName || "U").charAt(0).toUpperCase()}
                  </div>
                  <Link
                    to={accountPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-w-0 text-left"
                  >
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {userName || "User"}
                    </p>
                    <p className="truncate text-xs text-slate-400">Open account</p>
                  </Link>
                </div>
              )}

              <Link
                to="/upload-prescription"
                onClick={(event) => {
                  handleQuickOrderClick(event);
                  if (!event.defaultPrevented) {
                    setMobileMenuOpen(false);
                  }
                }}
                className="mb-3 flex items-center justify-center rounded-[6px] bg-[#ff6f61] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#f45d4f]"
              >
                Quick Order
              </Link>

              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 border border-[#ffb8b1] px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#ff6f61] transition hover:bg-[#fff1ef]"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
