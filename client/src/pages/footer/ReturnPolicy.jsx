import React from "react";
import {
    RotateCcw,
    ShieldCheck,
    PackageCheck,
    AlertTriangle,
    Clock3,
    Phone,
    Mail,
    FileText,
} from "lucide-react";

const policyPoints = [
    {
        icon: <PackageCheck size={22} />,
        title: "Eligible Products for Return",
        desc: "Only damaged, defective, wrong, or expired products are eligible for return or replacement. Return eligibility depends on product type and condition at the time of delivery.",
    },
    {
        icon: <ShieldCheck size={22} />,
        title: "Non-Returnable Products",
        desc: "Medicines, healthcare products, personal care items, opened wellness products, and temperature-sensitive items are generally non-returnable for safety and hygiene reasons unless delivered damaged or incorrect.",
    },
    {
        icon: <Clock3 size={22} />,
        title: "Return Request Time",
        desc: "Customers must raise a return or replacement request within 24 to 48 hours of delivery. Requests made after the allowed period may not be accepted.",
    },
    {
        icon: <AlertTriangle size={22} />,
        title: "Required Proof",
        desc: "For damaged, leaked, broken, expired, or incorrect products, customers may be asked to share product images, packaging images, invoice details, and a clear issue description.",
    },
];

const returnSteps = [
    "Go to your order details and identify the product issue.",
    "Contact our support team with your order ID and issue details.",
    "Share clear product images, outer packaging images, and invoice if requested.",
    "Our team will verify the request and confirm approval, replacement, or refund.",
    "If approved, pickup or resolution instructions will be shared with you.",
];

const nonReturnableItems = [
    "Opened or used medicines",
    "Prescription medicines once delivered correctly",
    "Personal hygiene and wellness items after seal break",
    "Products damaged due to misuse by customer",
    "Items returned without original packaging where required",
    "Temperature-controlled or perishable healthcare items",
];

const refundPoints = [
    "Refunds are processed only after return approval and verification.",
    "If replacement is available, we may offer replacement before refund.",
    "Approved refunds are usually credited to the original payment method.",
    "Refund timelines may vary depending on bank, UPI, wallet, or card provider.",
    "Cash on Delivery orders may be refunded through bank transfer, wallet, or store-approved method.",
];

const ReturnPolicy = () => {
    return (
        <section className="min-h-screen bg-[#f8fafc] py-8 sm:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Hero */}
                <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#F2FBFF] via-white to-[#F7FDFF]">
                    <div className="grid items-center gap-8 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-14">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF9FE] px-4 py-2 text-sm font-semibold text-[#87CEEB]">
                                <RotateCcw size={16} />
                                Return & Refund Policy
                            </div>

                            <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                                Return Policy for <br />
                                <span className="text-[#87CEEB]">𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘</span>
                            </h1>

                            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                We are committed to delivering genuine and safe healthcare
                                products. Because pharmacy and wellness products involve safety,
                                hygiene, and storage standards, returns are accepted only in
                                specific situations. Please review this policy carefully before
                                placing your order.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="p-2">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF9FE] text-[#87CEEB]">
                                    <RotateCcw size={22} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Easy Support
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Raise your issue quickly with order details and our team will
                                    review it as early as possible.
                                </p>
                            </div>

                            <div className="p-2">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <ShieldCheck size={22} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Safety First
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Medicines and healthcare essentials are handled under strict
                                    hygiene and safety guidelines.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Policy Cards */}
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {policyPoints.map((item, index) => (
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
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF9FE] text-[#87CEEB]">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Return Eligibility
                                </h2>
                            </div>

                            <div className="space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
                                <p>
                                    At 𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊 𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘, we aim to ensure every order reaches you
                                    in proper condition. However, returns or replacements may be
                                    accepted in situations such as:
                                </p>

                                <ul className="space-y-3 pl-5 text-slate-700">
                                    <li className="list-disc">
                                        Product delivered is damaged, broken, leaked, or physically
                                        defective.
                                    </li>
                                    <li className="list-disc">
                                        Wrong item was delivered instead of the ordered product.
                                    </li>
                                    <li className="list-disc">
                                        Product is expired or close to expiry beyond acceptable
                                        standards.
                                    </li>
                                    <li className="list-disc">
                                        Item is missing from the package, subject to verification.
                                    </li>
                                    <li className="list-disc">
                                        Prescription product mismatch due to fulfillment error.
                                    </li>
                                </ul>

                                <p>
                                    All return, replacement, or refund requests are subject to
                                    review and approval by our support team after verification of
                                    the complaint details.
                                </p>
                            </div>
                        </div>

                        <div className="p-1 sm:p-2">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                    <AlertTriangle size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Non-Returnable Products
                                </h2>
                            </div>

                            <p className="text-sm leading-7 text-slate-600 sm:text-base">
                                For hygiene, safety, and regulatory reasons, the following
                                products are usually not eligible for return unless received in a
                                damaged, defective, expired, or wrong condition:
                            </p>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {nonReturnableItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border-l-2 border-[#87CEEB] pl-4 text-sm font-medium text-slate-700"
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-1 sm:p-2">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <RotateCcw size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    How to Request a Return
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {returnSteps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-4 border-l-2 border-[#87CEEB] pl-4"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#87CEEB] text-sm font-bold text-white">
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
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <ShieldCheck size={20} />
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900">
                                    Refund Policy
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {refundPoints.map((point, index) => (
                                    <div
                                        key={index}
                                        className="border-l-2 border-[#87CEEB] pl-4 text-sm leading-6 text-slate-700"
                                    >
                                        {point}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="p-1 sm:p-2">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Important Note
                            </h3>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                Return approvals depend on product category, delivery condition,
                                customer complaint validity, and verification evidence. 𝐆𝐔𝐑𝐔𝐍𝐀𝐍𝐀𝐊
                                𝐏𝐇𝐀𝐑𝐌𝐀𝐂𝐘 reserves the right to accept or reject requests after
                                proper review.
                            </p>
                        </div>

                        <div className="p-1 sm:p-2">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Cancellation Policy
                            </h3>
                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                Orders can usually be cancelled before they are packed,
                                processed, or dispatched. Once shipped, cancellation may not be
                                possible and the order will fall under the return or replacement
                                policy terms where applicable.
                            </p>
                        </div>

                        <div className="p-1 sm:p-2">
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Contact Support
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
                                Please share your order ID, registered mobile number, and issue
                                details for faster assistance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReturnPolicy;
