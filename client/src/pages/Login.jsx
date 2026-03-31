import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Mail,
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
    icon: Mail,
    title: "Secure Email OTP Login",
    description:
      "Sign in quickly with your email address and OTP whenever you need access.",
    accent: "text-violet-600",
    bg: "bg-violet-50",
  },
];

const Login = () => {
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    otp: ["", "", "", "", "", ""],
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      setForm((prev) => ({ ...prev, email: value.trimStart() }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...form.otp];
    nextOtp[index] = value;
    setForm((prev) => ({ ...prev, otp: nextOtp }));

    if (value && index < form.otp.length - 1) {
      document.getElementById(`login-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !form.otp[index] && index > 0) {
      document.getElementById(`login-otp-${index - 1}`)?.focus();
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/auth/login/send-otp`, {
        email: form.email,
      });

      setForm((prev) => ({ ...prev, otp: ["", "", "", "", "", ""] }));
      setOtpSent(true);
      setMessage(res.data.message || "Login OTP sent to your email");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to send login OTP. Please try again.";

      setError(msg);

      if (msg.toLowerCase().includes("register first")) {
        setTimeout(() => {
          navigate("/register");
        }, 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const finalOtp = form.otp.join("");

    if (finalOtp.length !== 6) {
      setError("Please enter 6 digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/auth/login/verify-otp`, {
        email: form.email,
        otp: finalOtp,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessage(res.data.message || "Login successful");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "OTP verification failed. Please try again.";

      setError(msg);

      if (msg.toLowerCase().includes("register first")) {
        setTimeout(() => {
          navigate("/register");
        }, 1200);
      }
    } finally {
      setLoading(false);
    }
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
                      <Mail size={16} />
                      Email OTP
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
                        Enter email address
                      </label>
                      <div className="flex items-center border-b-2 border-rose-400 pb-2">
                        <Mail size={18} className="text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    </div>

                    {message && (
                      <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                        {message}
                      </p>
                    )}

                    {error && (
                      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </p>
                    )}

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
                      disabled={loading}
                      className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6f61] px-5 text-sm font-bold text-white transition hover:bg-[#f45d4f] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading
                        ? "Please wait..."
                        : otpSent
                          ? "Verify OTP"
                          : "Continue"}
                      <ArrowRight size={17} />
                    </button>
                  </form>
                </motion.div>

                <p className="mt-7 text-center text-sm text-slate-500">
                  New on Gurunanak?{" "}
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
