import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    BriefcaseMedical,
    CheckCircle2,
    FileText,
    Mail,
    MapPinned,
    PackageCheck,
    Phone,
    Pill,
    ShieldCheck,
    Stethoscope,
    Store,
    Users,
} from "lucide-react";
import {
    sendMrRegisterOtp,
    sendUserRegisterOtp,
    verifyMrRegisterOtp,
    verifyUserRegisterOtp,
} from "../api/authApi";

const userRegisterSlides = [
    {
        icon: Stethoscope,
        title: "Medicines, Home Delivered",
        description:
            "Order medicines and health products easily. Enjoy fast delivery, trusted service and great discounts on every order.",
        accent: "text-orange-500",
        bg: "bg-orange-50",
    },
    {
        icon: PackageCheck,
        title: "Track Every Order Easily",
        description:
            "Create your account to view order history, delivery status and saved details in one secure place.",
        accent: "text-cyan-600",
        bg: "bg-cyan-50",
    },
    {
        icon: Pill,
        title: "Fast Access To Essentials",
        description:
            "Save time at checkout and reorder your regular healthcare products whenever you need them.",
        accent: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        icon: ShieldCheck,
        title: "Secure Signup Experience",
        description:
            "Register with confidence using a modern sign-up flow built for safe and simple pharmacy access.",
        accent: "text-violet-600",
        bg: "bg-violet-50",
    },
    {
        icon: Mail,
        title: "Quick Email OTP Registration",
        description:
            "Create your account smoothly with your email address and OTP verification.",
        accent: "text-rose-500",
        bg: "bg-rose-50",
    },
];

const mrRegisterSlides = [
    {
        icon: BriefcaseMedical,
        title: "Join As MR",
        description:
            "Create your MR account and submit your store and license details for review.",
        accent: "text-orange-500",
        bg: "bg-orange-50",
    },
    {
        icon: Users,
        title: "Professional Access",
        description:
            "Approved MR accounts get a dedicated dashboard and role-based access.",
        accent: "text-cyan-600",
        bg: "bg-cyan-50",
    },
    {
        icon: ShieldCheck,
        title: "Admin Approval Workflow",
        description:
            "Every MR application is reviewed before login access is activated.",
        accent: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        icon: Store,
        title: "Store Verification Ready",
        description:
            "Share your medical store name and drug license details in one clean form.",
        accent: "text-violet-600",
        bg: "bg-violet-50",
    },
    {
        icon: Mail,
        title: "Stay Updated",
        description:
            "Once approved, you can login with your registered email OTP.",
        accent: "text-rose-500",
        bg: "bg-rose-50",
    },
];

const initialMrForm = {
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    medicalStoreName: "",
    gstNumber: "",
    panNumber: "",
    drugLicenseNumber: "",
    gstCertificate: null,
    drugLicenseDocument: null,
    otp: ["", "", "", "", "", ""],
};

const Register = () => {
    const navigate = useNavigate();
    const OTP_RESEND_SECONDS = 60;

    const [registerType, setRegisterType] = useState("user");
    const [otpSent, setOtpSent] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [registeredUser, setRegisteredUser] = useState(null);
    const [userForm, setUserForm] = useState({
        email: "",
        otp: ["", "", "", "", "", ""],
    });
    const [mrForm, setMrForm] = useState(initialMrForm);

    const slides = registerType === "mr" ? mrRegisterSlides : userRegisterSlides;
    const currentSlide = slides[activeSlide];
    const SlideIcon = currentSlide.icon;

    useEffect(() => {
        setActiveSlide(0);
        setOtpSent(false);
        setMessage("");
        setError("");
        setResendTimer(0);
        setShowSuccessPopup(false);
        setRegisteredUser(null);
        setUserForm({
            email: "",
            otp: ["", "", "", "", "", ""],
        });
        setMrForm(initialMrForm);
    }, [registerType]);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [slides.length]);

    useEffect(() => {
        if (!otpSent || resendTimer <= 0) {
            return undefined;
        }

        const timer = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [otpSent, resendTimer]);

    const handleSuccessPopupClose = () => {
        setShowSuccessPopup(false);

        if (registerType === "mr") {
            navigate("/login", {
                replace: true,
                state: {
                    message:
                        "MR registration submitted. Please wait for admin approval before login.",
                },
            });
            return;
        }

        if (registeredUser) {
            navigate("/user-dashboard", { replace: true });
            return;
        }

        navigate("/login", { replace: true });
    };

    const handleUserChange = (event) => {
        const { name, value } = event.target;

        if (name === "email") {
            setUserForm((prev) => ({ ...prev, email: value.trimStart() }));
            return;
        }

        setUserForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleMrChange = (event) => {
        const { name, value } = event.target;
        setMrForm((prev) => ({ ...prev, [name]: value.trimStart() }));
    };

    const handleMrFileChange = (event) => {
        const { name, files } = event.target;
        const nextFile = files?.[0] || null;

        setMrForm((prev) => ({
            ...prev,
            [name]: nextFile,
        }));
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) {
            return;
        }

        const nextOtp = [...userForm.otp];
        nextOtp[index] = value;

        setUserForm((prev) => ({ ...prev, otp: nextOtp }));

        if (value && index < userForm.otp.length - 1) {
            document.getElementById(`register-otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, event) => {
        if (event.key === "Backspace" && !userForm.otp[index] && index > 0) {
            document.getElementById(`register-otp-${index - 1}`)?.focus();
        }
    };

    const handleMrOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) {
            return;
        }

        const nextOtp = [...mrForm.otp];
        nextOtp[index] = value;

        setMrForm((prev) => ({ ...prev, otp: nextOtp }));

        if (value && index < mrForm.otp.length - 1) {
            document.getElementById(`mr-register-otp-${index + 1}`)?.focus();
        }
    };

    const handleMrOtpKeyDown = (index, event) => {
        if (event.key === "Backspace" && !mrForm.otp[index] && index > 0) {
            document.getElementById(`mr-register-otp-${index - 1}`)?.focus();
        }
    };

    const buildMrRegisterFormData = () => {
        const formData = new FormData();

        formData.append("name", mrForm.name.trim());
        formData.append("email", mrForm.email.trim());
        formData.append("phone", mrForm.phone.trim());
        formData.append("city", mrForm.city.trim());
        formData.append("state", mrForm.state.trim());
        formData.append("medicalStoreName", mrForm.medicalStoreName.trim());
        formData.append("gstNumber", mrForm.gstNumber.trim());
        formData.append("panNumber", mrForm.panNumber.trim());
        formData.append("drugLicenseNumber", mrForm.drugLicenseNumber.trim());

        if (mrForm.gstCertificate) {
            formData.append("gstCertificate", mrForm.gstCertificate);
        }

        if (mrForm.drugLicenseDocument) {
            formData.append("drugLicenseDocument", mrForm.drugLicenseDocument);
        }

        return formData;
    };

    const handleSendOtp = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!userForm.email) {
            setError("Please enter your email address");
            return;
        }

        try {
            setLoading(true);

            const { data } = await sendUserRegisterOtp({
                email: userForm.email,
                role: "user",
            });

            setUserForm((prev) => ({ ...prev, otp: ["", "", "", "", "", ""] }));
            setOtpSent(true);
            setResendTimer(OTP_RESEND_SECONDS);
            setMessage(data.message || "Register OTP sent to your email");
        } catch (err) {
            const nextMessage =
                err.response?.data?.message ||
                "Failed to send register OTP. Please try again.";

            setError(nextMessage);

            if (nextMessage.toLowerCase().includes("already registered")) {
                setTimeout(() => {
                    navigate("/login");
                }, 1200);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendUserOtp = async () => {
        setError("");
        setMessage("");

        if (!userForm.email || resendTimer > 0) {
            return;
        }

        try {
            setLoading(true);

            const { data } = await sendUserRegisterOtp({
                email: userForm.email,
                role: "user",
            });

            setUserForm((prev) => ({ ...prev, otp: ["", "", "", "", "", ""] }));
            setOtpSent(true);
            setResendTimer(OTP_RESEND_SECONDS);
            setMessage(data.message || "A new OTP has been sent to your email");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to resend register OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        const finalOtp = userForm.otp.join("");

        if (finalOtp.length !== 6) {
            setError("Please enter 6 digit OTP");
            return;
        }

        try {
            setLoading(true);

            const { data } = await verifyUserRegisterOtp({
                email: userForm.email,
                otp: finalOtp,
                role: "user",
            });

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.dispatchEvent(new Event("authchange"));

            setRegisteredUser(data.user || null);
            setMessage(data.message || "Registration successful");
            setShowSuccessPopup(true);
        } catch (err) {
            const nextMessage =
                err.response?.data?.message ||
                "OTP verification failed. Please try again.";

            setError(nextMessage);

            if (nextMessage.toLowerCase().includes("already registered")) {
                setTimeout(() => {
                    navigate("/login");
                }, 1200);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendMrOtp = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        const textFieldsToValidate = [
            "name",
            "email",
            "phone",
            "city",
            "state",
            "medicalStoreName",
            "gstNumber",
            "panNumber",
            "drugLicenseNumber",
        ];

        const missingField = textFieldsToValidate.find(
            (field) => !String(mrForm[field] || "").trim()
        );

        if (missingField || !mrForm.gstCertificate || !mrForm.drugLicenseDocument) {
            setError("Please fill in all MR registration fields and upload both documents");
            return;
        }

        try {
            setLoading(true);

            const { data } = await sendMrRegisterOtp(buildMrRegisterFormData());

            setMrForm((prev) => ({
                ...prev,
                otp: ["", "", "", "", "", ""],
            }));
            setOtpSent(true);
            setResendTimer(OTP_RESEND_SECONDS);
            setMessage(data.message || "MR registration OTP sent to your email");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to send MR registration OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendMrOtp = async () => {
        setError("");
        setMessage("");

        if (!mrForm.email || resendTimer > 0) {
            return;
        }

        try {
            setLoading(true);

            const { data } = await sendMrRegisterOtp(buildMrRegisterFormData());

            setMrForm((prev) => ({
                ...prev,
                otp: ["", "", "", "", "", ""],
            }));
            setOtpSent(true);
            setResendTimer(OTP_RESEND_SECONDS);
            setMessage(data.message || "A new MR registration OTP has been sent");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to resend MR registration OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyMrOtp = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        const finalOtp = mrForm.otp.join("");

        if (finalOtp.length !== 6) {
            setError("Please enter 6 digit OTP");
            return;
        }

        try {
            setLoading(true);

            const { data } = await verifyMrRegisterOtp({
                email: mrForm.email,
                otp: finalOtp,
            });

            setRegisteredUser(data.user || null);
            setMessage(
                data.message ||
                    "MR registration submitted successfully. Please wait for admin approval."
            );
            setShowSuccessPopup(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to verify MR registration OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const renderMrInput = ({
        name,
        label,
        placeholder,
        icon: Icon,
        type = "text",
    }) => (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>
            <div className="flex items-center border-b-2 border-rose-400 pb-2">
                <Icon size={18} className="text-slate-400" />
                <input
                    type={type}
                    name={name}
                    value={mrForm[name]}
                    onChange={handleMrChange}
                    disabled={otpSent}
                    placeholder={placeholder}
                    className="w-full bg-transparent px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                />
            </div>
        </div>
    );

    const renderMrFileInput = ({ name, label }) => (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>
            <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 transition hover:border-[#87CEEB] hover:bg-sky-50 ${otpSent ? "cursor-not-allowed opacity-70" : ""}`}>
                <FileText size={18} className="text-slate-400" />
                <span className="truncate">
                    {mrForm[name]?.name || `Upload ${label.toLowerCase()}`}
                </span>
                <input
                    type="file"
                    name={name}
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleMrFileChange}
                    disabled={otpSent}
                    className="hidden"
                />
            </label>
            <p className="mt-1 text-xs text-slate-400">Accepted: PDF, JPG, JPEG, PNG up to 5MB</p>
        </div>
    );

    return (
        <>
            {showSuccessPopup ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
                    <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.22)] sm:p-8">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 size={32} />
                        </div>

                        <h3 className="mt-5 text-2xl font-bold text-slate-900">
                            {registerType === "mr"
                                ? "MR Registration Submitted"
                                : "Registration Successful"}
                        </h3>

                        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                            {registerType === "mr"
                                ? "Your MR account request is now pending admin approval. You can login after approval."
                                : "Your account has been created successfully. Press OK to continue."}
                        </p>

                        <button
                            type="button"
                            onClick={handleSuccessPopupClose}
                            className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#87CEEB] px-6 text-sm font-bold text-white transition hover:bg-[#6EC6E8]"
                        >
                            OK
                        </button>
                    </div>
                </div>
            ) : null}

            <section className="bg-[#f6f7fb] py-3 sm:py-4">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                        <div className="grid min-h-[400px] grid-cols-1 lg:grid-cols-2">
                            <div className="hidden border-r border-slate-200 bg-[#fafafa] px-8 py-5 lg:flex lg:flex-col lg:items-center lg:justify-center">
                                <div className="max-w-md text-center">
                                    <div
                                        className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full shadow-inner ${currentSlide.bg}`}
                                    >
                                        <div
                                            className={`flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ${currentSlide.accent}`}
                                        >
                                            <SlideIcon size={36} />
                                        </div>
                                    </div>

                                    <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-800">
                                        {currentSlide.title}
                                    </h1>

                                    <p className="mt-3 text-base leading-7 text-slate-500">
                                        {currentSlide.description}
                                    </p>

                                    <div className="mt-6 flex items-center justify-center gap-2">
                                        {slides.map((_, index) => (
                                            <span
                                                key={index}
                                                className={`h-2.5 w-2.5 rounded-full ${
                                                    index === activeSlide
                                                        ? "bg-slate-700"
                                                        : "bg-slate-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center px-5 py-3 sm:px-7 lg:px-10">
                                <div className="w-full max-w-md">
                                    <div className="text-center lg:text-left">
                                        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-[38px]">
                                            {registerType === "mr" ? "MR Sign Up" : "Sign Up"}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {registerType === "mr"
                                                ? "Fill in your professional details to request MR access."
                                                : "Please enter your details to create your account."}
                                        </p>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setRegisterType("user")}
                                            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                                registerType === "user"
                                                    ? "bg-white text-slate-900 shadow"
                                                    : "text-slate-500"
                                            }`}
                                        >
                                            User Register
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setRegisterType("mr")}
                                            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                                registerType === "mr"
                                                    ? "bg-white text-slate-900 shadow"
                                                    : "text-slate-500"
                                            }`}
                                        >
                                            MR Register
                                        </button>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
                                        <button
                                            type="button"
                                            className="col-span-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow"
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <Mail size={16} />
                                                {registerType === "mr"
                                                    ? "Professional Registration"
                                                    : "Email OTP"}
                                            </span>
                                        </button>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, x: 14 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-5"
                                    >
                                        <form
                                            onSubmit={
                                                registerType === "mr"
                                                    ? otpSent
                                                      ? handleVerifyMrOtp
                                                      : handleSendMrOtp
                                                    : otpSent
                                                      ? handleVerifyOtp
                                                      : handleSendOtp
                                            }
                                            className="space-y-4"
                                        >
                                            {registerType === "mr" ? (
                                                <>
                                                    {renderMrInput({
                                                        name: "name",
                                                        label: "Full name",
                                                        placeholder: "Enter full name",
                                                        icon: BriefcaseMedical,
                                                    })}
                                                    {renderMrInput({
                                                        name: "email",
                                                        label: "Email address",
                                                        placeholder: "Enter email address",
                                                        icon: Mail,
                                                        type: "email",
                                                    })}
                                                    {renderMrInput({
                                                        name: "phone",
                                                        label: "Phone number",
                                                        placeholder: "Enter phone number",
                                                        icon: Phone,
                                                    })}
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        {renderMrInput({
                                                            name: "city",
                                                            label: "City",
                                                            placeholder: "Enter city",
                                                            icon: MapPinned,
                                                        })}
                                                        {renderMrInput({
                                                            name: "state",
                                                            label: "State",
                                                            placeholder: "Enter state",
                                                            icon: MapPinned,
                                                        })}
                                                    </div>
                                                    {renderMrInput({
                                                        name: "medicalStoreName",
                                                        label: "Medical store name",
                                                        placeholder: "Enter medical store name",
                                                        icon: Store,
                                                    })}
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        {renderMrInput({
                                                            name: "gstNumber",
                                                            label: "GST number",
                                                            placeholder: "Enter GST number",
                                                            icon: FileText,
                                                        })}
                                                        {renderMrInput({
                                                            name: "panNumber",
                                                            label: "PAN number",
                                                            placeholder: "Enter PAN number",
                                                            icon: FileText,
                                                        })}
                                                    </div>
                                                    {renderMrInput({
                                                        name: "drugLicenseNumber",
                                                        label: "Drug license number",
                                                        placeholder: "Enter drug license number",
                                                        icon: ShieldCheck,
                                                    })}
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        {renderMrFileInput({
                                                            name: "gstCertificate",
                                                            label: "GST certificate",
                                                        })}
                                                        {renderMrFileInput({
                                                            name: "drugLicenseDocument",
                                                            label: "License document",
                                                        })}
                                                    </div>
                                                </>
                                            ) : (
                                                <div>
                                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                        Enter email address
                                                    </label>
                                                    <div className="flex items-center border-b-2 border-rose-400 pb-2">
                                                        <Mail size={18} className="text-slate-400" />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={userForm.email}
                                                            onChange={handleUserChange}
                                                            placeholder="Enter email address"
                                                            className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {message ? (
                                                <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                                                    {message}
                                                </p>
                                            ) : null}

                                            {error ? (
                                                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                                    {error}
                                                </p>
                                            ) : null}

                                            {registerType === "user" && otpSent ? (
                                                <div>
                                                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                                                        Enter OTP
                                                    </label>

                                                    <div className="flex gap-3">
                                                        {userForm.otp.map((digit, index) => (
                                                            <input
                                                                key={index}
                                                                id={`register-otp-${index}`}
                                                                type="text"
                                                                inputMode="numeric"
                                                                maxLength={1}
                                                                value={digit}
                                                                onChange={(event) =>
                                                                    handleOtpChange(
                                                                        index,
                                                                        event.target.value
                                                                    )
                                                                }
                                                                onKeyDown={(event) =>
                                                                    handleOtpKeyDown(index, event)
                                                                }
                                                                className="h-12 w-12 rounded-xl border border-slate-300 text-center text-lg font-bold outline-none focus:border-orange-500"
                                                            />
                                                        ))}
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                                                        <span className="text-slate-500">
                                                            {resendTimer > 0
                                                                ? `Resend OTP in ${resendTimer}s`
                                                                : "Didn't receive the OTP?"}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={handleResendUserOtp}
                                                            disabled={loading || resendTimer > 0}
                                                            className="font-semibold text-[#87CEEB] transition hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                                                        >
                                                            Resend OTP
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : null}

                                            {registerType === "mr" && otpSent ? (
                                                <div>
                                                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                                                        Enter OTP
                                                    </label>

                                                    <div className="flex gap-3">
                                                        {mrForm.otp.map((digit, index) => (
                                                            <input
                                                                key={index}
                                                                id={`mr-register-otp-${index}`}
                                                                type="text"
                                                                inputMode="numeric"
                                                                maxLength={1}
                                                                value={digit}
                                                                onChange={(event) =>
                                                                    handleMrOtpChange(
                                                                        index,
                                                                        event.target.value
                                                                    )
                                                                }
                                                                onKeyDown={(event) =>
                                                                    handleMrOtpKeyDown(index, event)
                                                                }
                                                                className="h-12 w-12 rounded-xl border border-slate-300 text-center text-lg font-bold outline-none focus:border-orange-500"
                                                            />
                                                        ))}
                                                    </div>

                                                    <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-700">
                                                        Documents and MR details are locked after OTP send. If you need to change them, refresh the page and submit again.
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                                                        <span className="text-slate-500">
                                                            {resendTimer > 0
                                                                ? `Resend OTP in ${resendTimer}s`
                                                                : "Didn't receive the OTP?"}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={handleResendMrOtp}
                                                            disabled={loading || resendTimer > 0}
                                                            className="font-semibold text-[#87CEEB] transition hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                                                        >
                                                            Resend OTP
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : null}

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#87CEEB] px-5 text-sm font-bold text-white transition hover:bg-[#6EC6E8] disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {loading
                                                    ? "Please wait..."
                                                    : registerType === "mr"
                                                      ? otpSent
                                                        ? "Verify OTP"
                                                        : "Send OTP"
                                                      : otpSent
                                                        ? "Verify OTP"
                                                        : "Continue"}
                                                <ArrowRight size={17} />
                                            </button>
                                        </form>
                                    </motion.div>

                                    <p className="mt-5 text-center text-sm text-slate-500">
                                        Already registered?{" "}
                                        <Link
                                            to="/login"
                                            className="font-semibold text-[#87CEEB] hover:underline"
                                        >
                                            Login
                                        </Link>
                                    </p>

                                    <p className="mt-3 text-center text-xs leading-6 text-slate-500">
                                        By signing up, you agree to our{" "}
                                        <Link to="/terms" className="underline">
                                            Terms and Conditions
                                        </Link>{" "}
                                        &{" "}
                                        <Link to="/privacy-policy" className="underline">
                                            Privacy Policy
                                        </Link>
                                    </p>

                                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-700">
                                        <ShieldCheck size={14} />
                                        <span>
                                            {registerType === "mr"
                                                ? "Secure MR approval flow"
                                                : "Secure signup flow"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Register;
