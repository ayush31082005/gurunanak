import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../api";

const getCustomerDisplayName = (bank) => {
    const userName = String(bank?.user?.name || "").trim();

    if (userName) {
        return userName;
    }

    const accountHolderName = String(bank?.accountHolderName || "").trim();

    if (accountHolderName) {
        return accountHolderName;
    }

    const emailPrefix = String(bank?.user?.email || "")
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .trim();

    if (emailPrefix) {
        return emailPrefix.replace(/\b\w/g, (char) => char.toUpperCase());
    }

    return "N/A";
};

const UserBanksPage = () => {
    const [searchParams] = useSearchParams();
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchBankAccounts = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const { data } = await API.get("/banks/admin/all");
            setBankAccounts(Array.isArray(data.bankAccounts) ? data.bankAccounts : []);
        } catch (error) {
            setBankAccounts([]);
            setErrorMessage(error?.response?.data?.message || "Failed to fetch user bank details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBankAccounts();
    }, []);

    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();

    const filteredBankAccounts = useMemo(() => {
        if (!searchQuery) {
            return bankAccounts;
        }

        return bankAccounts.filter((bank) =>
            [
                getCustomerDisplayName(bank),
                bank.email,
                bank.mobileNumber,
                bank.user?.email,
                bank.user?.phone,
                bank.accountHolderName,
                bank.bankName,
                bank.accountNumber,
                bank.ifscCode,
                bank.branchName,
                bank.upiId,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(searchQuery)
        );
    }, [bankAccounts, searchQuery]);

    const stats = useMemo(() => {
        const usersWithAccounts = new Set(
            bankAccounts.map((bank) => String(bank.user?._id || "")).filter(Boolean)
        );

        return {
            totalAccounts: bankAccounts.length,
            uniqueUsers: usersWithAccounts.size,
            upiLinked: bankAccounts.filter((bank) => bank.upiId).length,
        };
    }, [bankAccounts]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Total Accounts
                    </p>
                    <h2 className="mt-3 text-4xl font-bold text-slate-900">{stats.totalAccounts}</h2>
                    <p className="mt-2 text-sm text-slate-500">All saved user bank accounts.</p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Users With Bank
                    </p>
                    <h2 className="mt-3 text-4xl font-bold text-slate-900">{stats.uniqueUsers}</h2>
                    <p className="mt-2 text-sm text-slate-500">Customers who saved payout details.</p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        UPI Linked
                    </p>
                    <h2 className="mt-3 text-4xl font-bold text-slate-900">{stats.upiLinked}</h2>
                    <p className="mt-2 text-sm text-slate-500">Accounts having UPI ID available.</p>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">User Bank Details</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Review saved bank details for refund and support operations.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchBankAccounts}
                        className="rounded-xl bg-[#0EA5E9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0284C7]"
                    >
                        Refresh Details
                    </button>
                </div>

                {loading ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        Loading bank details...
                    </div>
                ) : errorMessage ? (
                    <div className="mt-6 rounded-2xl bg-rose-50 p-8 text-center text-rose-600">
                        {errorMessage}
                    </div>
                ) : filteredBankAccounts.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        No bank details found{searchQuery ? " for this search." : "."}
                    </div>
                ) : (
                    <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1180px] w-full table-auto border-separate border-spacing-0">
                                <thead className="bg-slate-100">
                                    <tr className="text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">Customer</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">Email</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">Mobile</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">Account Holder</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">Bank</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">Account Number</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">IFSC</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">Branch</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4 font-semibold">UPI ID</th>
                                        <th className="border-b border-slate-200 px-4 py-4 font-semibold">Added</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBankAccounts.map((bank) => (
                                        <tr key={bank._id} className="text-sm transition hover:bg-slate-50/70">
                                        <td className="border-b border-r border-slate-200 px-4 py-4 font-semibold text-slate-900">
                                            {getCustomerDisplayName(bank)}
                                        </td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4 text-slate-600">{bank.email || bank.user?.email || "N/A"}</td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4 text-slate-600">{bank.mobileNumber || bank.user?.phone || "N/A"}</td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4 text-slate-600">{bank.accountHolderName}</td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4 text-slate-600">{bank.bankName}</td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4 font-medium text-slate-700">{bank.accountNumber}</td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4 text-slate-600">{bank.ifscCode}</td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4 text-slate-600">{bank.branchName || "N/A"}</td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4 text-slate-600">{bank.upiId || "N/A"}</td>
                                        <td className="border-b border-slate-200 px-4 py-4 text-slate-600">
                                            {bank.createdAt
                                                ? new Date(bank.createdAt).toLocaleDateString("en-IN")
                                                : "N/A"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserBanksPage;
