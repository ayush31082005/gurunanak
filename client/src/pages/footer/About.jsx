import React from "react";
import {
    HeartPulse,
    ShieldCheck,
    Users,
    Truck,
    Pill,
    Stethoscope,
    Phone,
    Mail,
    BadgeCheck,
    Sparkles,
} from "lucide-react";

const highlights = [
    {
        icon: <HeartPulse size={22} />,
        title: "Trusted Healthcare Partner",
        desc: "𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘 is committed to making healthcare products, medicines, and wellness essentials easily accessible to customers with convenience and trust.",
    },
    {
        icon: <ShieldCheck size={22} />,
        title: "Quality & Safety",
        desc: "We focus on genuine products, careful packaging, and a secure ordering experience so customers can shop for healthcare needs with confidence.",
    },
    {
        icon: <Truck size={22} />,
        title: "Reliable Delivery",
        desc: "From order placement to doorstep delivery, we work to provide a smooth and dependable experience for medicines, wellness items, and daily health essentials.",
    },
    {
        icon: <Users size={22} />,
        title: "Customer First",
        desc: "Our goal is to provide a customer-friendly pharmacy platform with helpful support, transparent policies, and a simple shopping journey.",
    },
];

const values = [
    {
        icon: <BadgeCheck size={20} />,
        title: "Authenticity",
        desc: "We believe customers should receive genuine and reliable healthcare products every time they shop with us.",
    },
    {
        icon: <Sparkles size={20} />,
        title: "Convenience",
        desc: "We aim to simplify the pharmacy shopping experience with an easy-to-use platform, fast search, and smooth checkout flow.",
    },
    {
        icon: <ShieldCheck size={20} />,
        title: "Trust",
        desc: "Trust is at the core of our service. We work to build long-term confidence through transparent support and responsible service.",
    },
    {
        icon: <Users size={20} />,
        title: "Care",
        desc: "We are focused on helping individuals and families access products that support better health and daily wellness.",
    },
];

const services = [
    "Online medicine ordering",
    "Prescription upload support",
    "Wellness and healthcare product shopping",
    "Personal care and daily health essentials",
    "Easy checkout and address management",
    "Customer support for orders and delivery",
];

const AboutUs = () => {
    return (
        <section className="min-h-screen bg-[#f8fafc] py-8 sm:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#F2FBFF] via-white to-[#f5fbff]">
                    <div className="grid items-center gap-8 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-14">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF9FE] px-4 py-2 text-sm font-semibold text-[#87CEEB]">
                                <HeartPulse size={16} />
                                About Us
                            </div>

                            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                                Welcome to <br />
                                <span className="text-[#87CEEB]">𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘</span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘 is built to make healthcare shopping more
                                convenient, reliable, and customer-friendly. Our platform helps
                                people access medicines, wellness products, and healthcare
                                essentials with comfort, trust, and ease.
                            </p>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                We believe that healthcare should be simple to access. That is
                                why we focus on creating a smooth digital pharmacy experience
                                with easy browsing, prescription support, safe checkout, and
                                dependable service.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="p-2">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF9FE] text-[#87CEEB]">
                                    <Pill size={22} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Wide Product Access
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Explore medicines, wellness products, personal care items, and
                                    everyday healthcare essentials in one place.
                                </p>
                            </div>

                            <div className="p-2">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <Stethoscope size={22} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Health-Focused Experience
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Our pharmacy platform is designed to support daily health
                                    needs with convenience, clarity, and trusted service.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Highlights */}
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {highlights.map((item, index) => (
                        <div
                            key={index}
                            className="p-2"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF9FE] text-[#87CEEB]">
                                {item.icon}
                            </div>
                            <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="p-1 sm:p-2">
                            <h2 className="text-2xl font-extrabold text-slate-900">
                                Who We Are
                            </h2>
                            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                                <p>
                                    𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘 is an online pharmacy and healthcare
                                    shopping platform created to help customers access important
                                    health products from the comfort of their homes.
                                </p>
                                <p>
                                    Our mission is to combine trust, convenience, and service in a
                                    single platform where customers can browse products, upload
                                    prescriptions, manage addresses, and place orders without
                                    unnecessary difficulty.
                                </p>
                                <p>
                                    We are focused on building a pharmacy experience that feels
                                    modern, easy to use, and dependable for individuals and
                                    families alike.
                                </p>
                            </div>
                        </div>

                        <div className="p-1 sm:p-2">
                            <h2 className="text-2xl font-extrabold text-slate-900">
                                What We Offer
                            </h2>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {services.map((service, index) => (
                                    <div
                                        key={index}
                                        className="border-l-2 border-[#87CEEB] pl-4 text-sm font-medium text-slate-700"
                                    >
                                        {service}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-1 sm:p-2">
                            <h2 className="text-2xl font-extrabold text-slate-900">
                                Our Vision
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                                Our vision is to become a trusted digital healthcare destination
                                where people can easily find medicines, wellness essentials, and
                                daily care products with convenience, confidence, and peace of
                                mind.
                            </p>
                        </div>

                        <div className="p-1 sm:p-2">
                            <h2 className="text-2xl font-extrabold text-slate-900">
                                Our Mission
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                                Our mission is to make pharmacy and healthcare shopping easier,
                                safer, and more accessible for everyone. We want customers to
                                feel confident while purchasing healthcare products online, with
                                clear policies, dependable support, and a smooth buying
                                experience.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="p-1 sm:p-2">
                                <h3 className="text-xl font-extrabold text-slate-900">
                                    Why Choose Us
                                </h3>
                                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                                    <p>Easy and modern online pharmacy experience</p>
                                    <p>Simple product browsing and checkout process</p>
                                    <p>Prescription upload and support options</p>
                                    <p>Customer-focused healthcare shopping platform</p>
                                    <p>Clear policies and helpful support experience</p>
                                </div>
                            </div>

                            <div className="p-1 sm:p-2">
                                <h3 className="text-xl font-extrabold text-slate-900">
                                    Contact Us
                                </h3>

                                <div className="mt-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Phone size={18} className="text-[#87CEEB]" />
                                        <span className="text-sm font-medium text-slate-700">
                                            +91 98765 43210
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Mail size={18} className="text-[#87CEEB]" />
                                        <span className="text-sm font-medium text-slate-700">
                                            support@gurunanakpharmacy.com
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm leading-7 text-slate-600">
                                    We are here to help you with your healthcare shopping journey.
                                    Reach out to us for support, order-related questions, or general
                                    assistance.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="p-1 sm:p-2">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Our Core Values
                            </h3>
                            <div className="mt-5 space-y-4">
                                {values.map((value, index) => (
                                    <div
                                        key={index}
                                        className="border-l-2 border-[#87CEEB] pl-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF9FE] text-[#87CEEB]">
                                                {value.icon}
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-slate-900">
                                                    {value.title}
                                                </h4>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">
                                            {value.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
