import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../api";
import StatusBadge from "../../components/admin/StatusBadge";

const prescriptionStatusOptions = [
    { value: "submitted", label: "Submitted" },
    { value: "reviewed", label: "Reviewed" },
    { value: "processed", label: "Processed" },
    { value: "rejected", label: "Rejected" },
];

const PrescriptionsPage = () => {
    const prescriptionsPerPage = 10;
    const [searchParams] = useSearchParams();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [updatingPrescriptionId, setUpdatingPrescriptionId] = useState("");
    const [deletingPrescriptionId, setDeletingPrescriptionId] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const { data } = await API.get("/prescriptions/admin/all");
            setPrescriptions(Array.isArray(data.prescriptions) ? data.prescriptions : []);
        } catch (error) {
            setPrescriptions([]);
            setErrorMessage(error?.response?.data?.message || "Failed to fetch prescriptions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions();
    }, []);

    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();

    const stats = useMemo(() => {
        return {
            total: prescriptions.length,
            submitted: prescriptions.filter((item) => item.status === "submitted").length,
            processed: prescriptions.filter((item) => item.status === "processed").length,
            rejected: prescriptions.filter((item) => item.status === "rejected").length,
        };
    }, [prescriptions]);

    const filteredPrescriptions = useMemo(() => {
        if (!searchQuery) {
            return prescriptions;
        }

        return prescriptions.filter((item) => {
            const searchableText = [
                item.name,
                item.email,
                item.mobile,
                item.fileName,
                item.fileType,
                item.address,
                item.status,
                item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(searchQuery);
        });
    }, [prescriptions, searchQuery]);

    const totalPages = Math.ceil(filteredPrescriptions.length / prescriptionsPerPage);

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

    const paginatedPrescriptions = useMemo(() => {
        const startIndex = (currentPage - 1) * prescriptionsPerPage;
        return filteredPrescriptions.slice(startIndex, startIndex + prescriptionsPerPage);
    }, [currentPage, filteredPrescriptions]);

    const paginationRange = useMemo(
        () => Array.from({ length: totalPages }, (_, index) => index + 1),
        [totalPages]
    );

    const startPrescriptionNumber =
        filteredPrescriptions.length === 0 ? 0 : (currentPage - 1) * prescriptionsPerPage + 1;
    const endPrescriptionNumber = Math.min(
        currentPage * prescriptionsPerPage,
        filteredPrescriptions.length
    );

    const handleStatusChange = async (prescriptionId, status) => {
        try {
            setUpdatingPrescriptionId(prescriptionId);

            const { data } = await API.put(`/prescriptions/admin/${prescriptionId}/status`, {
                status,
            });

            if (data.success) {
                setPrescriptions((currentPrescriptions) =>
                    currentPrescriptions.map((item) =>
                        item._id === prescriptionId ? { ...item, ...data.prescription } : item
                    )
                );
            }
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to update prescription status");
        } finally {
            setUpdatingPrescriptionId("");
        }
    };

    const handleDeletePrescription = async (prescriptionId) => {
        const shouldDelete = window.confirm(
            "Are you sure you want to delete this prescription?"
        );

        if (!shouldDelete) {
            return;
        }

        try {
            setDeletingPrescriptionId(prescriptionId);

            const { data } = await API.delete(`/prescriptions/admin/${prescriptionId}`);

            if (data.success) {
                setPrescriptions((currentPrescriptions) =>
                    currentPrescriptions.filter((item) => item._id !== prescriptionId)
                );
            }
        } catch (error) {
            alert(error?.response?.data?.message || "Failed to delete prescription");
        } finally {
            setDeletingPrescriptionId("");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Total Prescriptions</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</h3>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Submitted</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.submitted}</h3>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Processed</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.processed}</h3>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Rejected</p>
                    <h3 className="mt-2 text-3xl font-bold text-slate-900">{stats.rejected}</h3>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Prescription Management</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Review uploaded prescriptions and control their status.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchPrescriptions}
                        className="rounded-xl bg-[#0EA5E9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0284C7]"
                    >
                        Refresh Prescriptions
                    </button>
                </div>

                {loading ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        Loading prescriptions...
                    </div>
                ) : errorMessage ? (
                    <div className="mt-6 rounded-2xl bg-rose-50 p-8 text-center text-rose-600">
                        {errorMessage}
                    </div>
                ) : filteredPrescriptions.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        No prescriptions found{searchQuery ? " for this search." : "."}
                    </div>
                ) : (
                    <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
                        <div className="overflow-x-auto">
                            <table className="min-w-[1180px] w-full table-auto border-separate border-spacing-0">
                                <thead className="bg-slate-100">
                                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                        <th className="border-b border-r border-slate-200 px-4 py-4">Customer</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4">Contact</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4">File</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4">Address</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4">Status</th>
                                        <th className="border-b border-r border-slate-200 px-4 py-4">Update</th>
                                        <th className="border-b border-slate-200 px-4 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPrescriptions.map((item) => (
                                        <tr key={item._id} className="align-top text-sm transition hover:bg-slate-50/70">
                                        <td className="border-b border-r border-slate-200 px-4 py-4">
                                            <p className="font-semibold text-slate-900">{item.name}</p>
                                            <p className="mt-1 text-slate-500">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4">
                                            <p className="text-slate-700">{item.email}</p>
                                            <p className="mt-1 text-slate-500">{item.mobile}</p>
                                        </td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4">
                                            <p className="font-medium text-slate-800">{item.fileName}</p>
                                            <p className="mt-1 text-slate-500">{item.fileType}</p>
                                        </td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4">
                                            <p className="max-w-[260px] leading-6 text-slate-600">
                                                {item.address}
                                            </p>
                                        </td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4">
                                            <StatusBadge text={item.status} />
                                        </td>
                                        <td className="border-b border-r border-slate-200 px-4 py-4">
                                            <select
                                                value={item.status}
                                                onChange={(event) =>
                                                    handleStatusChange(item._id, event.target.value)
                                                }
                                                disabled={updatingPrescriptionId === item._id}
                                                className="min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-[#0EA5E9] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {prescriptionStatusOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="border-b border-slate-200 px-4 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                <a
                                                    href={item.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex rounded-xl bg-slate-100 px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-200"
                                                >
                                                    View File
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePrescription(item._id)}
                                                    disabled={deletingPrescriptionId === item._id}
                                                    className="inline-flex rounded-xl bg-rose-100 px-3 py-2 font-medium text-rose-600 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {deletingPrescriptionId === item._id ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing {startPrescriptionNumber}-{endPrescriptionNumber} of{" "}
                                {filteredPrescriptions.length} prescriptions
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

export default PrescriptionsPage;
