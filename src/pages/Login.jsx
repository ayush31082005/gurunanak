import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Smartphone,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Pill,
} from "lucide-react";

const loginSlides = [
  {
    icon: ShieldCheck,
    title: "Welcome Back",
    description:
      "Login to manage your prescriptions, orders and saved addresses.",
    accent: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: PackageCheck,
    title: "Track Your Orders Faster",
    description:
      "View delivery updates, reorder essentials and stay on top of every pharmacy purchase.",
    accent: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Pill,
    title: "Access Daily Essentials",
    description:
      "Continue where you left off and reach your medicines, wellness products and account details quickly.",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Smartphone,
    title: "Secure OTP Login",
    description:
      "Sign in quickly with your mobile number and OTP whenever you need access.",
    accent: "text-violet-600",
    bg: "bg-violet-50",
  },
];

const Login = () => {
  const [otpSent, setOtpSent] = useState(false);
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
      document.getElementById(`login-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !form.otp[index] && index > 0) {
      document.getElementById(`login-otp-${index - 1}`)?.focus();
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!form.mobile) return;
    setOtpSent(true);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    console.log("Verify OTP:", form.mobile, form.otp.join(""));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % loginSlides.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const currentSlide = loginSlides[activeSlide];
  const SlideIcon = currentSlide.icon;

  return (
    <section className="min-h-screen bg-[#f6f7fb] py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid min-h-[650px] grid-cols-1 lg:grid-cols-2">
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
                  {loginSlides.map((_, index) => (
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

            <div className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
              <div className="w-full max-w-md">
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                    Login
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Sign in to continue.
                  </p>
                </div>

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
                        Enter mobile number
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

                    {otpSent && (
                      <div>
                        <label className="mb-3 block text-sm font-semibold text-slate-700">
                          Enter OTP
                        </label>
                        <div className="flex gap-3">
                          {form.otp.map((digit, index) => (
                            <input
                              key={index}
                              id={`login-otp-${index}`}
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
                  New on MediShop?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-[#ff6f61] hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
