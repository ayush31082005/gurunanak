import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Pill,
    ShoppingCart,
    Users,
    FileText,
    LogOut,
    X,
} from "lucide-react";

const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Products", path: "/admin/products", icon: Pill },
    { label: "Orders", path: "/admin/orders", icon: ShoppingCart },
    { label: "Customers", path: "/admin/customers", icon: Users },
    { label: "Prescriptions", path: "/admin/prescriptions", icon: FileText },
];

const AdminSidebar = ({ mobileOpen, setMobileOpen }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setMobileOpen(false);
        navigate("/login", { replace: true });
    };

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed left-0 top-0 z-40 flex h-full w-[280px] flex-col overflow-hidden border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Gurunanak Pharmacy</h1>
                        <p className="text-sm text-slate-500">Pharmacy Dashboard</p>
                    </div>

                    <button
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
                    <p className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Main Menu
                    </p>

                    <nav className="mt-4 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-[#ff6f61] text-white shadow-lg shadow-[#ff6f61]/25"
                                                : "text-slate-600 hover:bg-slate-100"
                                        }`
                                    }
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>

                    <div className="mt-8 border-t border-slate-200 pt-6">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#ff6f61]"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
