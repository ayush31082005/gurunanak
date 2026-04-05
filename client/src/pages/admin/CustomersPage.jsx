
import React, { useEffect, useMemo, useState } from "react";
import API from "../../api";

const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const { data } = await API.get("/auth/admin/customers");

            setCustomers(Array.isArray(data.customers) ? data.customers : []);
            setTotalUsers(Number(data.totalUsers) || 0);
        } catch (error) {
            setCustomers([]);
            setTotalUsers(0);
            setErrorMessage(error?.response?.data?.message || "Failed to fetch customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const stats = useMemo(() => {
        return {
            verified: customers.filter((customer) => customer.isVerified).length,
            ordered: customers.filter((customer) => Number(customer.orders) > 0).length,
        };
    }, [customers]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Total Users
                    </p>
                    <h2 className="mt-3 text-4xl font-bold text-slate-900">{totalUsers}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Admin yahan se total registered users dekh sakta hai.
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Verified Users
                    </p>
                    <h3 className="mt-3 text-4xl font-bold text-slate-900">{stats.verified}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Login ya register complete kar chuke users.
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Ordering Users
                    </p>
                    <h3 className="mt-3 text-4xl font-bold text-slate-900">{stats.ordered}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Jinhone kam se kam ek order place kiya hai.
                    </p>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Customers</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            View real customer details and total user activity.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchCustomers}
                        className="rounded-xl bg-[#87CEEB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6EC6E8]"
                    >
                        Refresh Customers
                    </button>
                </div>

                {loading ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        Loading customers...
                    </div>
                ) : errorMessage ? (
                    <div className="mt-6 rounded-2xl bg-rose-50 p-8 text-center text-rose-600">
                        {errorMessage}
                    </div>
                ) : customers.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        No customers found.
                    </div>
                ) : (
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
                                    <tr key={customer._id} className="border-b border-slate-100 text-sm">
                                        <td className="py-4 font-semibold text-slate-900">
                                            {customer.name}
                                        </td>
                                        <td className="py-4 text-slate-600">{customer.email}</td>
                                        <td className="py-4 text-slate-600">{customer.phone}</td>
                                        <td className="py-4 text-slate-600">{customer.city}</td>
                                        <td className="py-4 text-slate-600">{customer.orders}</td>
                                        <td className="py-4 text-slate-600">
                                            {customer.joined
                                                ? new Date(customer.joined).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomersPage;
