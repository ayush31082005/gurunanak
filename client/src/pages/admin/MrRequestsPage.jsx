import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    approveMrRequest,
    getPendingMrRequests,
    rejectMrRequest,
} from "../../api/authApi";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const getDocumentUrl = (value = "") => {
    if (!value) {
        return "";
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    return `${SERVER_BASE_URL}${value}`;
};

const MrRequestsPage = () => {
    const requestsPerPage = 8;
    const [searchParams] = useSearchParams();
    const [mrRequests, setMrRequests] = useState([]);
    const [totalRequests, setTotalRequests] = useState(0);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [actionState, setActionState] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    const fetchMrRequests = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const { data } = await getPendingMrRequests();

            setMrRequests(Array.isArray(data.mrRequests) ? data.mrRequests : []);
            setTotalRequests(Number(data.totalRequests) || 0);
        } catch (error) {
            setMrRequests([]);
            setTotalRequests(0);
            setErrorMessage(
                error?.response?.data?.message || "Failed to fetch MR requests"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMrRequests();
    }, []);

    const searchQuery = (searchParams.get("search") || "").trim().toLowerCase();

    const filteredRequests = useMemo(() => {
        if (!searchQuery) {
            return mrRequests;
        }

        return mrRequests.filter((request) => {
            const searchableText = [
                request.name,
                request.email,
                request.phone,
                request.city,
                request.state,
                request.medicalStoreName,
                request.gstNumber,
                request.panNumber,
                request.drugLicenseNumber,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(searchQuery);
        });
    }, [mrRequests, searchQuery]);

    const coveredCities = useMemo(
        () =>
            new Set(
                mrRequests
                    .map((request) => `${request.city}-${request.state}`.toLowerCase())
                    .filter(Boolean)
            ).size,
        [mrRequests]
    );

    const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

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

    const paginatedRequests = useMemo(() => {
        const startIndex = (currentPage - 1) * requestsPerPage;
        return filteredRequests.slice(startIndex, startIndex + requestsPerPage);
    }, [currentPage, filteredRequests]);

    const paginationRange = useMemo(
        () => Array.from({ length: totalPages }, (_, index) => index + 1),
        [totalPages]
    );

    const startRequestNumber =
        filteredRequests.length === 0 ? 0 : (currentPage - 1) * requestsPerPage + 1;
    const endRequestNumber = Math.min(
        currentPage * requestsPerPage,
        filteredRequests.length
    );

    const handleRequestAction = async (requestId, action) => {
        try {
            setActionState((prev) => ({ ...prev, [requestId]: action }));
            setErrorMessage("");

            if (action === "approve") {
                await approveMrRequest(requestId);
            } else {
                await rejectMrRequest(requestId);
            }

            setMrRequests((prev) => prev.filter((request) => request._id !== requestId));
            setTotalRequests((prev) => Math.max(prev - 1, 0));
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message ||
                    `Failed to ${action} MR request`
            );
        } finally {
            setActionState((prev) => {
                const nextState = { ...prev };
                delete nextState[requestId];
                return nextState;
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Pending MR Requests
                    </p>
                    <h2 className="mt-3 text-4xl font-bold text-slate-900">
                        {totalRequests}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Medical representative applications waiting for review.
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Search Results
                    </p>
                    <h3 className="mt-3 text-4xl font-bold text-slate-900">
                        {filteredRequests.length}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Requests matching the current admin search input.
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Cities Covered
                    </p>
                    <h3 className="mt-3 text-4xl font-bold text-slate-900">
                        {coveredCities}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                        Locations represented across pending MR applications.
                    </p>
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">MR Requests</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Review medical representative applications and take action.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchMrRequests}
                        className="rounded-xl bg-[#87CEEB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6EC6E8]"
                    >
                        Refresh Requests
                    </button>
                </div>

                {errorMessage ? (
                    <div className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                        {errorMessage}
                    </div>
                ) : null}

                {loading ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        Loading MR requests...
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-slate-500">
                        No pending MR requests found{searchQuery ? " for this search." : "."}
                    </div>
                ) : (
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                                    <th className="pb-3 font-semibold">MR Details</th>
                                    <th className="pb-3 font-semibold">Contact</th>
                                    <th className="pb-3 font-semibold">Store</th>
                                    <th className="pb-3 font-semibold">Compliance</th>
                                    <th className="pb-3 font-semibold">Documents</th>
                                    <th className="pb-3 font-semibold">Requested</th>
                                    <th className="pb-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRequests.map((request) => {
                                    const pendingAction = actionState[request._id];

                                    return (
                                        <tr
                                            key={request._id}
                                            className="border-b border-slate-100 align-top text-sm"
                                        >
                                            <td className="py-4">
                                                <p className="font-semibold text-slate-900">
                                                    {request.name}
                                                </p>
                                                <p className="mt-1 text-slate-500">
                                                    {request.city}, {request.state}
                                                </p>
                                            </td>
                                            <td className="py-4 text-slate-600">
                                                <p>{request.email}</p>
                                                <p className="mt-1">{request.phone}</p>
                                            </td>
                                            <td className="py-4 text-slate-600">
                                                {request.medicalStoreName}
                                            </td>
                                            <td className="py-4 text-slate-600">
                                                <p>GST: {request.gstNumber || "N/A"}</p>
                                                <p className="mt-1">PAN: {request.panNumber || "N/A"}</p>
                                                <p className="mt-1">
                                                    License: {request.drugLicenseNumber || "N/A"}
                                                </p>
                                            </td>
                                            <td className="py-4 text-slate-600">
                                                <div className="flex flex-col gap-2">
                                                    {request.gstCertificateUrl ? (
                                                        <a
                                                            href={getDocumentUrl(request.gstCertificateUrl)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="font-medium text-sky-600 hover:underline"
                                                        >
                                                            View GST
                                                        </a>
                                                    ) : (
                                                        <span>N/A</span>
                                                    )}
                                                    {request.drugLicenseDocumentUrl ? (
                                                        <a
                                                            href={getDocumentUrl(
                                                                request.drugLicenseDocumentUrl
                                                            )}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="font-medium text-sky-600 hover:underline"
                                                        >
                                                            View License
                                                        </a>
                                                    ) : (
                                                        <span>N/A</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 text-slate-600">
                                                {request.createdAt
                                                    ? new Date(
                                                          request.createdAt
                                                      ).toLocaleDateString()
                                                    : "N/A"}
                                            </td>
                                            <td className="py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRequestAction(
                                                                request._id,
                                                                "reject"
                                                            )
                                                        }
                                                        disabled={!!pendingAction}
                                                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {pendingAction === "reject"
                                                            ? "Rejecting..."
                                                            : "Reject"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRequestAction(
                                                                request._id,
                                                                "approve"
                                                            )
                                                        }
                                                        disabled={!!pendingAction}
                                                        className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {pendingAction === "approve"
                                                            ? "Approving..."
                                                            : "Approve"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-slate-500">
                                Showing {startRequestNumber}-{endRequestNumber} of{" "}
                                {filteredRequests.length} requests
                            </p>

                            {totalPages > 1 ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage((page) => Math.max(page - 1, 1))
                                        }
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
                                                    ? "bg-[#87CEEB] text-white"
                                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage((page) =>
                                                Math.min(page + 1, totalPages)
                                            )
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

export default MrRequestsPage;
