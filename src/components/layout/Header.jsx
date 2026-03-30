import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const { cartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    setActiveDesktopMenu(null);
    setActiveTabletMenu(null);
    setActiveMobileCategory(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const activeTabletCategory = categoryMenu.find(
    (item) => item.slug === activeTabletMenu
  );

  const getDesktopDropdownPosition = (index) => {
    if (index >= categoryMenu.length - 2) {
      return "right-0";
    }

    return "left-0";
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
                  to={`/shop/${category.slug}/${link.slug}`}
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-4 lg:px-6">
        <div className="flex min-h-[72px] items-center justify-between gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-slate-700 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/" className="flex shrink-0 items-center gap-2">
              <h1 className="text-[22px] font-extrabold leading-none text-slate-800 sm:text-[24px]">
                GURUNANAK
              </h1>
            </Link>

            <button className="hidden items-center gap-1 text-sm font-medium text-gray-700 md:flex">
              <MapPin size={16} className="text-orange-500" />
              <span className="max-w-[90px] truncate lg:max-w-none">New Delhi</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>
          </div>

          <div className="hidden flex-1 md:block">
            <div className="mx-2 flex h-[44px] w-full items-center rounded-full border border-gray-200 bg-[#f8f8fb] px-4">
              <Search size={18} className="shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines, wellness products and more..."
                className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
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

            <Link
              to="/upload-prescription"
              className="hidden rounded-full bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 sm:block lg:px-5 lg:py-3"
            >
              Quick Order
            </Link>
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <div className="flex h-[42px] w-full items-center rounded-full border border-gray-200 bg-[#f8f8fb] px-4">
            <Search size={18} className="shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines, wellness products..."
              className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="hidden border-t border-gray-100 lg:block">
        <div className="mx-auto flex max-w-[1280px] items-center gap-2 px-4 py-2 xl:px-6">
          {categoryMenu.map((item, index) => (
            <div
              key={item.slug}
              className="relative"
              onMouseEnter={() => setActiveDesktopMenu(item.slug)}
              onMouseLeave={() => setActiveDesktopMenu(null)}
            >
              <Link
                to={`/shop/${item.slug}`}
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
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <div className="mx-auto max-w-[1280px] px-4 py-4">
            <button className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-700 md:hidden">
              <MapPin size={16} className="text-orange-500" />
              <span>New Delhi</span>
              <ChevronDown size={14} className="text-gray-500" />
            </button>

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
                className="col-span-2 rounded-lg bg-slate-800 px-4 py-3 text-center text-sm font-semibold text-white sm:col-span-1"
              >
                Quick Order
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                        to={`/shop/${item.slug}`}
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
                              to={`/shop/${item.slug}/${link.slug}`}
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
