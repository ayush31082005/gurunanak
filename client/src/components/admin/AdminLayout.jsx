import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const titleMap = {
    "/admin/dashboard": "Dashboard",
    "/admin/products": "Products",
    "/admin/products/all": "All Products",
    "/admin/orders": "Orders",
    "/admin/returns": "Returns",
    "/admin/user-banks": "User Bank",
    "/admin/inventory": "Inventory",
    "/admin/customers": "Customers",
    "/admin/mr-requests": "MR Requests",
    "/admin/mr-products": "MR Product Requests",
    "/admin/prescriptions": "Prescriptions",
};

const AdminLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const title = titleMap[location.pathname] || "Dashboard";

    return (
        <div className="min-h-screen bg-slate-50">
            <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            <div className="lg:pl-[280px]">
                <AdminHeader title={title} setMobileOpen={setMobileOpen} />
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
