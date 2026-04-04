import React from "react";
import {
    ShieldCheck,
    Lock,
    FileText,
    Database,
    Eye,
    UserCheck,
    Phone,
    Mail,
    Bell,
} from "lucide-react";

const infoCollected = [
    {
        icon: <UserCheck size={22} />,
        title: "Personal Information",
        desc: "We may collect your name, mobile number, email address, delivery address, and account details when you register, place an order, or contact us.",
    },
    {
        icon: <FileText size={22} />,
        title: "Order & Prescription Data",
        desc: "We may collect order history, transaction details, uploaded prescriptions, requested medicines, and related healthcare purchase information to process your orders accurately.",
    },
    {
        icon: <Database size={22} />,
        title: "Technical Information",
        desc: "We may automatically collect device details, browser type, IP address, pages visited, and usage activity to improve website performance and user experience.",
    },
    {
        icon: <Bell size={22} />,
        title: "Communication Preferences",
        desc: "We may store your preferences related to order updates, promotional messages, offers, reminders, and service notifications.",
    },
];

const usagePoints = [
    "To create and manage your account on 𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘.",
    "To process orders, verify prescriptions, and deliver products to the correct address.",
    "To provide customer support, issue refunds, handle returns, and resolve complaints.",
    "To send order confirmations, payment updates, delivery alerts, and service-related notifications.",
    "To improve our website, app experience, search features, and healthcare shopping journey.",
    "To detect fraud, misuse, unauthorized activity, and to comply with legal obligations.",
];

const sharePoints = [
    "Delivery and logistics partners for order fulfillment.",
    "Payment gateways and financial partners for secure transaction processing.",
    "Internal support and operations teams for service management.",
    "Technology or hosting partners who help maintain the platform securely.",
    "Government, legal, or regulatory authorities when required by law.",
];

const securityPoints = [
    "We use reasonable technical and organizational measures to protect your personal data.",
    "Sensitive order and account information is handled with restricted access controls.",
    "We work to prevent unauthorized access, misuse, loss, disclosure, or alteration of your information.",
    "Although we strive to protect your data, no online transmission or storage method is completely risk-free.",
];

const userRights = [
    "Access your account information",
    "Update or correct your profile details",
    "Request deletion of certain account data, subject to legal obligations",
    "Opt out of promotional communication",
    "Contact support for privacy-related concerns",
];

const PrivacyPolicy = () => {
    return (
        <section className="min-h-screen bg-[#f8fafc] py-8 sm:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Hero */}
                <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#eef7ff] via-white to-[#f7fbff] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <div className="grid items-center gap-8 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-14">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
                                <ShieldCheck size={16} />
                                Privacy Policy
                            </div>

                            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                                Privacy Policy for <br />
                                <span className="text-[#ff6f61]">𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘</span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                Your privacy is important to us. This Privacy Policy explains how
                                𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘 collects, uses, stores, protects, and shares
                                your information when you access our website, create an account,
                                upload prescriptions, place orders, or interact with our services.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <Lock size={22} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Data Protection
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    We take reasonable steps to keep your personal and order data
                                    secure across our systems.
                                </p>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1ef] text-[#ff6f61]">
                                    <Eye size={22} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Transparent Use
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    We explain clearly why information is collected and how it is
                                    used to deliver better service.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top cards */}
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {infoCollected.map((item, index) => (
                        <div
                            key={index}
                            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1ef] text-[#ff6f61]">
                                {item.icon}
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main content */}
                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <Database size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Information We Collect
                                </h2>
                            </div>

                            <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                                <p>
                                    We may collect personal, transactional, prescription-related,
                                    and technical information when you interact with our website or
                                    services. This can include your identity details, contact
                                    information, delivery address, order records, payment status,
                                    uploaded medical documents, and website usage data.
                                </p>
                                <p>
                                    The information you provide helps us serve you better,
                                    complete your orders, verify medical requirements where needed,
                                    and maintain a reliable and safe healthcare platform.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    How We Use Your Information
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {usagePoints.map((point, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                                    >
                                        {point}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                    <UserCheck size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Sharing of Information
                                </h2>
                            </div>

                            <p className="mb-4 text-sm leading-7 text-slate-600 sm:text-base">
                                We do not sell your personal data. However, your information may
                                be shared only when necessary for providing services, fulfilling
                                orders, improving operations, or complying with legal
                                requirements.
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {sharePoints.map((point, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
                                    >
                                        {point}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                                    <Lock size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Data Security
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {securityPoints.map((point, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                                    >
                                        {point}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                                    <ShieldCheck size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Your Rights & Choices
                                </h2>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {userRights.map((right, index) => (
                                    <div
                                        key={index}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                                    >
                                        {right}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Cookies & Tracking
                            </h3>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                We may use cookies and similar technologies to improve site
                                functionality, remember preferences, understand user behavior,
                                and enhance browsing experience. You may control some cookie
                                settings through your browser preferences.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Third-Party Services
                            </h3>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                Our platform may use third-party tools such as payment gateways,
                                shipping services, analytics tools, and communication systems.
                                These services may process limited data as required to support
                                the functionality of our platform.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Policy Updates
                            </h3>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                We may update this Privacy Policy from time to time to reflect
                                business, legal, technical, or service-related changes. Updated
                                versions will be posted on this page with revised policy
                                content.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Contact Us
                            </h3>

                            <div className="mt-5 space-y-4">
                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                                    <Phone size={18} className="text-[#ff6f61]" />
                                    <span className="text-sm font-medium text-slate-700">
                                        +91 98765 43210
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                                    <Mail size={18} className="text-[#ff6f61]" />
                                    <span className="text-sm font-medium text-slate-700">
                                        privacy@gurunanakpharmacy.com
                                    </span>
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                For privacy concerns, account data issues, or personal
                                information requests, please contact our support team.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrivacyPolicy;