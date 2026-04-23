import React from "react";
import {
    Truck,
    Clock3,
    MapPin,
    ShieldCheck,
    PackageCheck,
    AlertCircle,
    Phone,
    Mail,
    FileText,
} from "lucide-react";

const shippingHighlights = [
    {
        icon: <Truck size={22} />,
        title: "Order Processing",
        desc: "Orders are usually processed after successful confirmation, payment verification, and prescription validation where required. Processing time may vary depending on product type and availability.",
    },
    {
        icon: <Clock3 size={22} />,
        title: "Estimated Delivery Time",
        desc: "Delivery timelines depend on your location, serviceability, stock availability, courier partner operations, and local conditions. Standard deliveries may take a few business days.",
    },
    {
        icon: <MapPin size={22} />,
        title: "Serviceable Locations",
        desc: "We aim to deliver across a wide range of locations. However, delivery availability depends on pincode coverage, logistics access, product restrictions, and regional service conditions.",
    },
    {
        icon: <ShieldCheck size={22} />,
        title: "Safe Packaging",
        desc: "Products are packed carefully to maintain quality and safety during transit. Sensitive or regulated items may be shipped under additional handling guidelines.",
    },
];

const shippingSteps = [
    "Order is placed successfully on the website.",
    "Payment and product availability are confirmed.",
    "Prescription is reviewed for applicable medicines.",
    "Order is packed and prepared for dispatch.",
    "Shipping partner picks up the package.",
    "Order is delivered to the registered address.",
];

const delayReasons = [
    "Incorrect or incomplete delivery address",
    "Pincode not serviceable by courier partner",
    "Prescription verification pending",
    "Product temporarily out of stock",
    "Bad weather, strikes, or transport disruptions",
    "High order volume during sale or festive periods",
];

const importantNotes = [
    "Delivery timelines are estimates and may vary based on operational conditions.",
    "Prescription medicines may require additional review before dispatch.",
    "Some healthcare, fragile, or temperature-sensitive products may have shipping limitations.",
    "Customers are requested to provide accurate name, phone number, address, and pincode for smooth delivery.",
    "Delivery charges, if applicable, may be shown at checkout before final order confirmation.",
];

const ShippingPolicy = () => {
    return (
        <section className="min-h-screen bg-[#f8fafc] py-8 sm:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Hero */}
                <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#eefaf3] via-white to-[#f8fffb]">
                    <div className="grid items-center gap-8 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-14">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
                                <Truck size={16} />
                                Shipping Policy
                            </div>

                            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                                Shipping Policy for <br />
                                <span className="text-[#0EA5E9]">𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘</span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                This Shipping Policy explains how orders placed on
                                𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘 are processed, packed, dispatched, and delivered.
                                Our goal is to ensure a smooth, safe, and reliable delivery
                                experience for medicines, wellness products, and healthcare essentials.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="p-2">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <PackageCheck size={22} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Secure Dispatch
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Orders are packed with care to reduce damage risk and maintain
                                    product quality during shipment.
                                </p>
                            </div>

                            <div className="p-2">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E0F2FE] text-[#0EA5E9]">
                                    <Clock3 size={22} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Timely Delivery
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    We work to dispatch and deliver orders as quickly as possible,
                                    subject to availability and verification needs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Highlight cards */}
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {shippingHighlights.map((item, index) => (
                        <div
                            key={index}
                            className="p-2"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E0F2FE] text-[#0EA5E9]">
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
                        <div className="p-1 sm:p-2">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Order Processing & Dispatch
                                </h2>
                            </div>

                            <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                                <p>
                                    Once an order is placed, it goes through multiple checks such as
                                    payment confirmation, stock verification, and prescription review
                                    where required. After successful verification, the order is prepared
                                    for packing and dispatch.
                                </p>
                                <p>
                                    Processing time may vary depending on product type, regulatory
                                    requirements, order volume, and delivery location. Orders placed on
                                    weekends, holidays, or outside working hours may require additional
                                    processing time.
                                </p>
                            </div>
                        </div>

                        <div className="p-1 sm:p-2">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <Truck size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Shipping Process
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {shippingSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-4 border-l-2 border-[#0EA5E9] pl-4"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0EA5E9] text-sm font-bold text-white">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm font-medium leading-6 text-slate-700">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-1 sm:p-2">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                    <AlertCircle size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Possible Delivery Delays
                                </h2>
                            </div>

                            <p className="mb-4 text-sm leading-7 text-slate-600 sm:text-base">
                                While we try to ensure timely delivery, delays can happen due to
                                operational, address-related, or external reasons.
                            </p>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {delayReasons.map((reason, index) => (
                                    <div
                                        key={index}
                                        className="border-l-2 border-[#0EA5E9] pl-4 text-sm font-medium text-slate-700"
                                    >
                                        {reason}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-1 sm:p-2">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                                    <ShieldCheck size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Important Shipping Notes
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {importantNotes.map((note, index) => (
                                    <div
                                        key={index}
                                        className="border-l-2 border-[#0EA5E9] pl-4 text-sm leading-6 text-slate-700"
                                    >
                                        {note}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="p-1 sm:p-2">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Delivery Coverage
                            </h3>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                Delivery availability depends on pincode serviceability, product
                                category, courier partner support, and local transportation access.
                                Some locations may have limited or delayed delivery service.
                            </p>
                        </div>

                        <div className="p-1 sm:p-2">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Address Accuracy
                            </h3>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                Customers should ensure that the provided delivery address,
                                contact number, and pincode are correct and complete. Incorrect
                                details may result in delivery failure, delay, or reattempt charges
                                depending on the case.
                            </p>
                        </div>

                        <div className="p-1 sm:p-2">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Contact Support
                            </h3>

                            <div className="mt-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone size={18} className="text-[#0EA5E9]" />
                                    <span className="text-sm font-medium text-slate-700">
                                        +91 98765 43210
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Mail size={18} className="text-[#0EA5E9]" />
                                    <span className="text-sm font-medium text-slate-700">
                                        shipping@gurunanakpharmacy.com
                                    </span>
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                For shipping, delivery, dispatch, or tracking related concerns,
                                please contact our support team with your order ID and registered details.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShippingPolicy;
