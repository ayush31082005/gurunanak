
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../api";

const CustomersPage = () => {
    const customersPerPage = 10;
    const [searchParams] = useSearchParams();
    const [customers, setCustomers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

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

    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();

    const stats = useMemo(() => {
        return {
            verified: customers.filter((customer) => customer.isVerified).length,
            ordered: customers.filter((customer) => Number(customer.orders) > 0).length,
        };
    }, [customers]);

    const filteredCustomers = useMemo(() => {
        if (!searchQuery) {
            return customers;
        }

        return customers.filter((customer) => {
            const searchableText = [
                customer.name,
                customer.email,
                customer.phone,
                customer.city,
                customer.orders,
                customer.joined ? new Date(customer.joined).toLocaleDateString() : "",
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(searchQuery);
        });
    }, [customers, searchQuery]);

    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        if (totalPages === 0) {
            setCurrentPage(1);
            return;
        }

        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * customersPerPage;
        return filteredCustomers.slice(startIndex, startIndex + customersPerPage);
    }, [currentPage, filteredCustomers]);

    const paginationRange = useMemo(
        () => Array.from({ length: totalPages }, (_, index) => index + 1),
        [totalPages]
    );

    const startCustomerNumber =
        filteredCustomers.length === 0 ? 0 : (currentPage - 1) * customersPerPage + 1;
    const endCustomerNumber = Math.min(currentPage * customersPerPage, filteredCustomers.length);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Total Users
                    </p>
                    <h2 className="mt-3 text-4xl font-bold text-slate-900">{totalUsers}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        View the total number of registered users.
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Verified Users
                    </p>
                    <h3 className="mt-3 text-4xl font-bold text-slate-900">{stats.verified}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Users who have completed login or registration.
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Ordering Users
                    </p>
                    <h3 className="mt-3 text-4xl font-bold text-slate-900">{stats.ordered}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Users who have placed at least one order.
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
                        className="rounded-xl bg-[#0EA5E9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0284C7]"
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
                ) : filteredCustomers.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        No customers found{searchQuery ? " for this search." : "."}
                    </div>
                ) : (
                    <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto border-separate border-spacing-0">
                                <thead className="bg-slate-100">
                                    <tr className="text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">Customer</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">Email</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">Phone</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">City</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">Orders</th>
                                        <th className="border-b border-slate-200 px-4 py-4 font-semibold">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedCustomers.map((customer) => (
                                        <tr key={customer._id} className="text-sm transition hover:bg-slate-50/70">
                                            <td className="border-b border-r border-slate-200 px-4 py-4 font-semibold text-slate-900">
                                                {customer.name}
                                            </td>
                                            <td className="border-b border-r border-slate-200 px-4 py-4 text-slate-600">{customer.email}</td>
                                            <td className="border-b border-r border-slate-200 px-4 py-4 text-slate-600">{customer.phone}</td>
                                            <td className="border-b border-r border-slate-200 px-4 py-4 text-slate-600">{customer.city}</td>
                                            <td className="border-b border-r border-slate-200 px-4 py-4 text-slate-600">{customer.orders}</td>
                                            <td className="border-b border-slate-200 px-4 py-4 text-slate-600">
                                                {customer.joined
                                                    ? new Date(customer.joined).toLocaleDateString()
                                                    : "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing {startCustomerNumber}-{endCustomerNumber} of {filteredCustomers.length} customers
                            </p>

                            {totalPages > 1 ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Prev
                                    </button>

                                    {paginationRange.map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            type="button"
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                                currentPage === pageNumber
                                                    ? "bg-[#0EA5E9] text-white"
                                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage((page) => Math.min(page + 1, totalPages))
                                        }
                                        disabled={currentPage === totalPages}
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomersPage;
