import React from "react";
import { Menu, Search } from "lucide-react";

const AdminHeader = ({ title, setMobileOpen }) => {
    return (
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <div className="flex items-center gap-3">
                    <button
                        className="rounded-xl border border-slate-200 p-2 text-slate-700 lg:hidden"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu size={20} />
                    </button>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                        <p className="text-sm text-slate-500">
                            Welcome back, manage your pharmacy smoothly.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#87CEEB] sm:w-72"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
