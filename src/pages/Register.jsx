import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Smartphone,
  ShieldCheck,
  Stethoscope,
  Pill,
  PackageCheck,
} from "lucide-react";

const registerSlides = [
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
    icon: Smartphone,
    title: "Quick OTP Registration",
    description:
      "Create your account smoothly with your mobile number and OTP verification.",
    accent: "text-rose-500",
    bg: "bg-rose-50",
  },
];

const Register = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [isHealthCareExpert, setIsHealthCareExpert] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [form, setForm] = useState({
    mobile: "",
    otp: ["", "", "", ""],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...form.otp];
    nextOtp[index] = value;
    setForm((prev) => ({ ...prev, otp: nextOtp }));

    if (value && index < 3) {
      document.getElementById(`register-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !form.otp[index] && index > 0) {
      document.getElementById(`register-otp-${index - 1}`)?.focus();
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!form.mobile) return;

    setOtpSent(true);
    console.log("Register OTP sent:", {
      mobile: form.mobile,
      isHealthCareExpert,
    });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    console.log("Register verify OTP:", {
      mobile: form.mobile,
      otp: form.otp.join(""),
      isHealthCareExpert,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % registerSlides.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const currentSlide = registerSlides[activeSlide];
  const SlideIcon = currentSlide.icon;

  return (
    <section className="min-h-screen bg-[#f6f7fb] py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid min-h-[650px] grid-cols-1 lg:grid-cols-2">
            {/* Left Side */}
            <div className="hidden border-r border-slate-200 bg-[#fafafa] px-10 py-12 lg:flex lg:flex-col lg:items-center lg:justify-center">
              <div className="max-w-md text-center">
                <div className={`mx-auto flex h-32 w-32 items-center justify-center rounded-full shadow-inner ${currentSlide.bg}`}>
                  <div className={`flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm ${currentSlide.accent}`}>
                    <SlideIcon size={42} />
                  </div>
                </div>

                <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-800">
                  {currentSlide.title}
                </h1>

                <p className="mt-5 text-lg leading-8 text-slate-500">
                  {currentSlide.description}
                </p>

                <div className="mt-8 flex items-center justify-center gap-2">
                  {registerSlides.map((_, index) => (
                    <span
                      key={index}
                      className={`h-2.5 w-2.5 rounded-full ${
                        index === activeSlide ? "bg-slate-700" : "bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
              <div className="w-full max-w-md">
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                    Sign Up
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Please enter your details to create your account.
                  </p>
                </div>

                {/* Tabs */}
                <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
                  <button
                    type="button"
                    className="col-span-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Smartphone size={16} />
                      Mobile OTP
                    </span>
                  </button>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-7"
                >
                  <form
                    onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                    className="space-y-5"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Enter 10 digit mobile number
                      </label>
                      <div className="flex items-center border-b-2 border-rose-400 pb-2">
                        <Smartphone size={18} className="text-slate-400" />
                        <input
                          type="tel"
                          name="mobile"
                          value={form.mobile}
                          onChange={handleChange}
                          placeholder="Enter mobile number"
                          maxLength={10}
                          className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={isHealthCareExpert}
                        onChange={(e) => setIsHealthCareExpert(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span>Are You a HealthCare Expert?</span>
                    </label>

                    {otpSent && (
                      <div>
                        <label className="mb-3 block text-sm font-semibold text-slate-700">
                          Enter OTP
                        </label>
                        <div className="flex gap-3">
                          {form.otp.map((digit, index) => (
                            <input
                              key={index}
                              id={`register-otp-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handleOtpChange(index, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className="h-12 w-12 rounded-xl border border-slate-300 text-center text-lg font-bold outline-none focus:border-orange-500"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6f61] px-5 text-sm font-bold text-white transition hover:bg-[#f45d4f]"
                    >
                      Continue
                      <ArrowRight size={17} />
                    </button>
                  </form>
                </motion.div>

                <p className="mt-7 text-center text-sm text-slate-500">
                  Already on MediShop?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-[#ff6f61] hover:underline"
                  >
                    Login
                  </Link>
                </p>

                <p className="mt-4 text-center text-xs leading-6 text-slate-500">
                  By signing up, you agree to our{" "}
                  <Link to="/terms" className="underline">
                    Terms and Conditions
                  </Link>{" "}
                  &{" "}
                  <Link to="/privacy-policy" className="underline">
                    Privacy Policy
                  </Link>
                </p>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-emerald-700">
                  <ShieldCheck size={14} />
                  <span>Secure signup flow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
