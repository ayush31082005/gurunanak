
import React from "react";
import { customers } from "../../data/adminData";

const CustomersPage = () => {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Customers</h2>
            <p className="mt-1 text-sm text-slate-500">View customer details and activity.</p>

            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                            <th className="pb-3 font-semibold">Customer</th>
                            <th className="pb-3 font-semibold">Email</th>
                            <th className="pb-3 font-semibold">Phone</th>
                            <th className="pb-3 font-semibold">City</th>
                            <th className="pb-3 font-semibold">Orders</th>
                            <th className="pb-3 font-semibold">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.email} className="border-b border-slate-100 text-sm">
                                <td className="py-4 font-semibold text-slate-900">{customer.name}</td>
                                <td className="py-4 text-slate-600">{customer.email}</td>
                                <td className="py-4 text-slate-600">{customer.phone}</td>
                                <td className="py-4 text-slate-600">{customer.city}</td>
                                <td className="py-4 text-slate-600">{customer.orders}</td>
                                <td className="py-4 text-slate-600">{customer.joined}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersPage;