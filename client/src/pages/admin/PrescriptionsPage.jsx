import React from "react";
import { prescriptionRequests } from "../../data/adminData";
import StatusBadge from "../../components/admin/StatusBadge";

const PrescriptionsPage = () => {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Prescription Management</h2>
            <p className="mt-1 text-sm text-slate-500">
                Review uploaded prescriptions and approve requests.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {prescriptionRequests.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-semibold text-slate-900">{item.name}</h3>
                            <StatusBadge text={item.status} />
                        </div>

                        <p className="mt-3 text-sm text-slate-600">Medicine: {item.medicine}</p>
                        <p className="mt-1 text-sm text-slate-500">Uploaded: {item.uploadedAt}</p>

                        <div className="mt-4 flex gap-3">
                            <button className="flex-1 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                                Reject
                            </button>
                            <button className="flex-1 rounded-xl bg-[#ff6f61] px-4 py-2 text-sm font-semibold text-white">
                                Approve
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrescriptionsPage;
