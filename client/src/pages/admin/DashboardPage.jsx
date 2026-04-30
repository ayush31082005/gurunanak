import React, { useEffect, useMemo, useState } from "react";
import {
    Area,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    Bell,
    IndianRupee,
    Package,
    ShoppingCart,
    Users,
} from "lucide-react";
import API from "../../api";

const chartGrid = "rgba(148, 163, 184, 0.14)";

const panelClassName =
    "rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:border-sky-200 hover:shadow-[0_18px_40px_rgba(14,165,233,0.10)]";

const defaultStats = {
    totalSales: 0,
    totalOrders: 0,
    activeOrders: 0,
    totalUsers: 0,
    totalMrAccounts: 0,
    totalProducts: 0,
    lowStockItems: 0,
    pendingMrRequests: 0,
    prescriptions: 0,
};

const defaultTrends = {
    sales: [],
    orders: [],
    users: [],
    activeOrders: [],
    mr: [],
};

const formatCount = (value) => Number(value || 0).toLocaleString("en-IN");

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const formatCompactCurrency = (value) => {
    const amount = Number(value || 0);

    if (amount >= 10000000) {
        return `Rs ${(amount / 10000000).toFixed(2)}Cr`;
    }

    if (amount >= 100000) {
        return `Rs ${(amount / 100000).toFixed(2)}L`;
    }

    if (amount >= 1000) {
        return `Rs ${(amount / 1000).toFixed(1)}K`;
    }

    return formatCurrency(amount);
};

const getTrendDelta = (series = []) => {
    const values = series.map((item) => Number(item?.value) || 0);
    const lastValue = values[values.length - 1] || 0;
    const previousValue = values[values.length - 2] || 0;

    if (previousValue === 0) {
        return lastValue > 0 ? { label: "+100%", tone: "emerald" } : { label: "Flat", tone: "slate" };
    }

    const delta = ((lastValue - previousValue) / previousValue) * 100;
    const rounded = `${delta > 0 ? "+" : ""}${delta.toFixed(0)}%`;

    if (delta > 0) {
        return { label: rounded, tone: "emerald" };
    }

    if (delta < 0) {
        return { label: rounded, tone: "rose" };
    }

    return { label: "Flat", tone: "slate" };
};

const badgeToneClassNames = {
    emerald: "bg-emerald-400/20 text-emerald-100",
    rose: "bg-rose-400/20 text-rose-100",
    amber: "bg-amber-400/20 text-amber-100",
    cyan: "bg-cyan-400/20 text-cyan-100",
    slate: "bg-slate-100 text-slate-600",
};

const buildMergedTrendData = (salesSeries = [], ordersSeries = []) => {
    const salesMap = new Map(salesSeries.map((item) => [item.label, Number(item.value) || 0]));
    const orderMap = new Map(ordersSeries.map((item) => [item.label, Number(item.value) || 0]));
    const labels = Array.from(new Set([...salesMap.keys(), ...orderMap.keys()]));

    return labels.map((label) => ({
        label,
        sales: salesMap.get(label) || 0,
        orders: orderMap.get(label) || 0,
    }));
};

const DashboardTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-xl">
            {label ? <p className="mb-2 font-semibold text-slate-900">{label}</p> : null}
            <div className="space-y-1.5">
                {payload.map((entry) => {
                    const isSales = entry.dataKey === "sales";

                    return (
                        <div key={`${entry.dataKey}-${entry.name}`} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-2 text-slate-500">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                {entry.name}
                            </span>
                            <span className="font-semibold text-slate-900">
                                {isSales ? formatCurrency(entry.value) : formatCount(entry.value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ChartCard = ({ title, subtitle, action, className = "", children }) => (
    <section className={`${panelClassName} ${className}`}>
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div>
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
            </div>
            {action ? <div className="w-full sm:w-auto">{action}</div> : null}
        </div>
        {children}
    </section>
);

const StatCard = ({ title, value, subtitle, icon: Icon, gradient, glow, badge, badgeTone = "slate", footnote }) => (
    <article
        className={`group relative overflow-hidden rounded-[22px] border border-slate-200 bg-gradient-to-br ${gradient} p-4 text-slate-900 shadow-sm transition duration-300 hover:-translate-y-1 sm:rounded-[24px] ${glow}`}
    >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_42%)]" />
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/50 blur-2xl" />

        <div className="relative flex items-start justify-between gap-3">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
                <h2 className="mt-3 text-[1.65rem] font-bold leading-none tracking-tight sm:text-[1.9rem]">{value}</h2>
                <p className="mt-2 text-xs text-slate-600 sm:text-sm">{subtitle}</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white/80 p-2.5 text-sky-600 backdrop-blur">
                <Icon size={20} />
            </div>
        </div>

        <div className="relative mt-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeToneClassNames[badgeTone]}`}>
                {badge}
            </span>
            <span className="text-[11px] font-medium text-slate-500">{footnote}</span>
        </div>
    </article>
);

const renderPeakDot = (props) => {
    const { cx, cy, value } = props;

    if (typeof cx !== "number" || typeof cy !== "number") {
        return null;
    }

    return (
        <g>
            <rect x={cx - 38} y={cy - 46} width="76" height="24" rx="8" fill="#0ea5e9" />
            <text x={cx} y={cy - 30} fill="#fff" fontSize="10" fontWeight="700" textAnchor="middle">
                {formatCompactCurrency(value)}
            </text>
            <circle cx={cx} cy={cy} r="7" fill="rgba(14,165,233,0.18)" />
            <circle cx={cx} cy={cy} r="4.5" fill="#0ea5e9" stroke="#bae6fd" strokeWidth="2" />
        </g>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(defaultStats);
    const [trends, setTrends] = useState(defaultTrends);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const { data } = await API.get("/auth/admin/dashboard");

                setStats({
                    totalSales: data?.stats?.totalSales || 0,
                    totalOrders: data?.stats?.totalOrders || 0,
                    activeOrders: data?.stats?.activeOrders || 0,
                    totalUsers: data?.stats?.totalUsers || 0,
                    totalMrAccounts: data?.stats?.totalMrAccounts || 0,
                    totalProducts: data?.stats?.totalProducts || 0,
                    lowStockItems: data?.stats?.lowStockItems || 0,
                    pendingMrRequests: data?.stats?.pendingMrRequests || 0,
                    prescriptions: data?.stats?.prescriptions || 0,
                });

                setTrends({
                    sales: Array.isArray(data?.trends?.sales) ? data.trends.sales : [],
                    orders: Array.isArray(data?.trends?.orders) ? data.trends.orders : [],
                    users: Array.isArray(data?.trends?.users) ? data.trends.users : [],
                    activeOrders: Array.isArray(data?.trends?.activeOrders) ? data.trends.activeOrders : [],
                    mr: Array.isArray(data?.trends?.mr) ? data.trends.mr : [],
                });
            } catch (error) {
                setErrorMessage(error?.response?.data?.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const salesVsOrdersData = useMemo(
        () => buildMergedTrendData(trends.sales, trends.orders),
        [trends.orders, trends.sales]
    );

    const userMixData = useMemo(
        () => [
            { name: "Customers", value: stats.totalUsers, color: "#22d3ee" },
            { name: "MR Accounts", value: stats.totalMrAccounts, color: "#3b82f6" },
        ].filter((item) => item.value > 0),
        [stats.totalMrAccounts, stats.totalUsers]
    );

    const productMixData = useMemo(
        () => [
            {
                name: "Healthy Stock",
                value: Math.max((stats.totalProducts || 0) - (stats.lowStockItems || 0), 0),
                color: "#8b5cf6",
            },
            {
                name: "Low Stock",
                value: stats.lowStockItems || 0,
                color: "#ec4899",
            },
        ].filter((item) => item.value > 0),
        [stats.lowStockItems, stats.totalProducts]
    );

    const totalUserCount = useMemo(
        () => userMixData.reduce((sum, item) => sum + item.value, 0),
        [userMixData]
    );

    const totalProductCount = useMemo(
        () => productMixData.reduce((sum, item) => sum + item.value, 0),
        [productMixData]
    );

    const userLegend = useMemo(
        () =>
            userMixData.map((item) => ({
                ...item,
                percent: totalUserCount ? ((item.value / totalUserCount) * 100).toFixed(1) : "0.0",
            })),
        [totalUserCount, userMixData]
    );

    const productLegend = useMemo(
        () =>
            productMixData.map((item) => ({
                ...item,
                percent: totalProductCount ? ((item.value / totalProductCount) * 100).toFixed(1) : "0.0",
            })),
        [productMixData, totalProductCount]
    );

    const salesDelta = useMemo(() => getTrendDelta(trends.sales), [trends.sales]);
    const ordersDelta = useMemo(() => getTrendDelta(trends.orders), [trends.orders]);
    const usersDelta = useMemo(() => getTrendDelta(trends.users), [trends.users]);

    const topStats = useMemo(
        () => [
            {
                title: "Total Orders",
                value: formatCount(stats.totalOrders),
                subtitle: `${formatCount(stats.activeOrders)} orders are currently active`,
                icon: ShoppingCart,
                gradient: "from-sky-50 via-cyan-50 to-blue-100",
                glow: "hover:shadow-[0_18px_38px_rgba(14,165,233,0.12)]",
                badge: ordersDelta.label,
                badgeTone: ordersDelta.tone,
                footnote: "order trend",
            },
            {
                title: "Total Sales",
                value: formatCurrency(stats.totalSales),
                subtitle: "Revenue from delivered medicine orders",
                icon: IndianRupee,
                gradient: "from-blue-50 via-sky-50 to-indigo-100",
                glow: "hover:shadow-[0_18px_38px_rgba(59,130,246,0.12)]",
                badge: salesDelta.label,
                badgeTone: salesDelta.tone,
                footnote: "sales trend",
            },
            {
                title: "Total Users",
                value: formatCount(stats.totalUsers),
                subtitle: `${formatCount(stats.totalMrAccounts)} MR accounts are also onboarded`,
                icon: Users,
                gradient: "from-white via-slate-50 to-sky-50",
                glow: "hover:shadow-[0_18px_38px_rgba(14,165,233,0.08)]",
                badge: usersDelta.label,
                badgeTone: usersDelta.tone,
                footnote: "user growth",
            },
            {
                title: "Total Products",
                value: formatCount(stats.totalProducts),
                subtitle: `${formatCount(stats.lowStockItems)} products need stock attention`,
                icon: Package,
                gradient: "from-white via-slate-50 to-cyan-50",
                glow: "hover:shadow-[0_18px_38px_rgba(14,165,233,0.08)]",
                badge: `${formatCount(stats.pendingMrRequests)} pending MR`,
                badgeTone: stats.pendingMrRequests > 0 ? "amber" : "slate",
                footnote: "catalog health",
            },
        ],
        [
            ordersDelta.label,
            ordersDelta.tone,
            salesDelta.label,
            salesDelta.tone,
            stats.activeOrders,
            stats.lowStockItems,
            stats.pendingMrRequests,
            stats.totalMrAccounts,
            stats.totalOrders,
            stats.totalProducts,
            stats.totalSales,
            stats.totalUsers,
            usersDelta.label,
            usersDelta.tone,
        ]
    );

    const peakSalePoint = useMemo(
        () =>
            salesVsOrdersData.reduce(
                (best, item) => (item.sales > best.sales ? item : best),
                salesVsOrdersData[0] || { label: "", sales: 0, orders: 0 }
            ),
        [salesVsOrdersData]
    );

    return (
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-sky-50/70 to-slate-100 p-2 text-slate-900 shadow-sm sm:rounded-[36px] sm:p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.10),transparent_24%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

            <div className="relative">
                <main className="min-w-0 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[30px] sm:p-6">
                    <div className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-gradient-to-r from-white via-sky-50/70 to-white px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:rounded-[24px] sm:px-4 sm:py-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">
                                Pharmacy Admin Analytics
                            </p>
                            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Gurunanak pharmacy business dashboard
                            </h1>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-start">
                            <div className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 md:flex">
                                Live database metrics
                            </div>
                            <button
                                type="button"
                                className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 transition hover:border-sky-300 hover:text-sky-600"
                            >
                                <Bell size={18} />
                                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_16px_rgba(14,165,233,0.45)]" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-[150px] animate-pulse rounded-[24px] border border-slate-200 bg-white"
                                />
                            ))}
                        </div>
                    ) : errorMessage ? (
                        <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
                            {errorMessage}
                        </div>
                    ) : (
                        <>
                            <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                                {topStats.map((item) => (
                                    <StatCard key={item.title} {...item} />
                                ))}
                            </div>

                            <div className="mt-6">
                                <ChartCard
                                    title="Total Sale"
                                    subtitle="Sales and order movement from your live pharmacy dashboard."
                                    action={
                                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 sm:justify-end">
                                            <span className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                                                Total Sales
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <span className="h-2.5 w-2.5 rounded-full border border-blue-500" />
                                                Order Count
                                            </span>
                                        </div>
                                    }
                                >
                                    <div className="h-[240px] sm:h-[320px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={salesVsOrdersData} margin={{ top: 20, right: 18, left: 0, bottom: 6 }}>
                                                <defs>
                                                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.28} />
                                                        <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid stroke={chartGrid} vertical={true} />
                                                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <YAxis
                                                    yAxisId="sales"
                                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={(value) => formatCompactCurrency(value).replace("Rs ", "")}
                                                />
                                                <YAxis yAxisId="orders" hide />
                                                <Tooltip content={<DashboardTooltip />} />
                                                <Area
                                                    yAxisId="sales"
                                                    type="monotone"
                                                    dataKey="sales"
                                                    stroke="none"
                                                    fill="url(#salesFill)"
                                                    legendType="none"
                                                />
                                                <Line
                                                    yAxisId="sales"
                                                    type="monotone"
                                                    dataKey="sales"
                                                    name="Total Sales"
                                                    stroke="#0ea5e9"
                                                    strokeWidth={3}
                                                    dot={false}
                                                    activeDot={{ r: 6, stroke: "#bae6fd", strokeWidth: 2, fill: "#0ea5e9" }}
                                                />
                                                <Line
                                                    yAxisId="orders"
                                                    type="monotone"
                                                    dataKey="orders"
                                                    name="Order Count"
                                                    stroke="#2563eb"
                                                    strokeWidth={2.5}
                                                    strokeDasharray="2 6"
                                                    dot={false}
                                                    activeDot={{ r: 5, stroke: "#bfdbfe", strokeWidth: 2, fill: "#2563eb" }}
                                                />
                                                <Line
                                                    yAxisId="sales"
                                                    type="monotone"
                                                    dataKey="sales"
                                                    stroke="transparent"
                                                    legendType="none"
                                                    dot={false}
                                                    activeDot={false}
                                                >
                                                    <LabelList
                                                        dataKey="sales"
                                                        content={(props) =>
                                                            props.value === peakSalePoint.sales ? renderPeakDot(props) : null
                                                        }
                                                    />
                                                </Line>
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </ChartCard>
                            </div>

                            <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(320px,0.9fr)]">
                                <ChartCard title="Total User" subtitle="Customer and MR account distribution.">
                                    <div className="flex items-center justify-center">
                                        <div className="relative h-[210px] w-full max-w-[260px] sm:h-[230px] sm:max-w-[280px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={userMixData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        innerRadius={54}
                                                        outerRadius={82}
                                                        paddingAngle={3}
                                                        stroke="rgba(15,23,42,0.5)"
                                                        strokeWidth={3}
                                                    >
                                                        {userMixData.map((entry) => (
                                                            <Cell key={entry.name} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<DashboardTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>

                                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                                                    Total Users
                                                </p>
                                                <p className="mt-2 text-3xl font-bold text-slate-900">{formatCount(totalUserCount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </ChartCard>

                                <ChartCard title="Total Product" subtitle="Catalog health based on stock status.">
                                    <div className="space-y-4">
                                        <div className="relative h-[210px] sm:h-[230px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={productMixData}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        innerRadius={62}
                                                        outerRadius={88}
                                                        paddingAngle={2}
                                                        stroke="rgba(15,23,42,0.65)"
                                                        strokeWidth={4}
                                                    >
                                                        {productMixData.map((entry) => (
                                                            <Cell key={entry.name} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<DashboardTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>

                                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                                <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                                                    Products
                                                </p>
                                                <p className="mt-2 text-3xl font-bold text-slate-900">{formatCount(totalProductCount)}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {productLegend.map((item) => (
                                                <div
                                                    key={item.name}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="flex min-w-0 items-center gap-3 text-sm text-slate-700">
                                                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                            {item.name}
                                                        </span>
                                                        <span className="text-sm font-semibold text-slate-900">{item.percent}%</span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-slate-400">{formatCount(item.value)} products</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </ChartCard>

                                <ChartCard title="Total Order" subtitle="Order volume across the latest trend buckets.">
                                    <div className="h-[240px] sm:h-[320px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={trends.orders} margin={{ top: 16, right: 8, left: -18, bottom: 6 }}>
                                                <defs>
                                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#22d3ee" />
                                                        <stop offset="55%" stopColor="#38bdf8" />
                                                        <stop offset="100%" stopColor="#818cf8" />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid stroke={chartGrid} vertical={true} />
                                                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <Tooltip content={<DashboardTooltip />} />
                                                <Bar dataKey="value" name="Orders" radius={[12, 12, 4, 4]} fill="url(#barGradient)" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </ChartCard>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
