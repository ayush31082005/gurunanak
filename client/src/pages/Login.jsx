import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const OTP_RESEND_SECONDS = 60;

  const [otpSent, setOtpSent] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(location.state?.message || "");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [form, setForm] = useState({
    email: "",
    otp: ["", "", "", "", "", ""],
  });

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const redirectTo = location.state?.redirectTo;
    const checkoutState = location.state?.checkoutState;

    if (!token) {
      return;
    }

    try {
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (redirectTo) {
        navigate(redirectTo, {
          state: checkoutState,
          replace: true,
        });
        return;
      }

      navigate("/user-dashboard", { replace: true });
    } catch (error) {
      if (redirectTo) {
        navigate(redirectTo, {
          state: checkoutState,
          replace: true,
        });
        return;
      }

      navigate("/user-dashboard", { replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    setMessage(location.state?.message || "");
  }, [location.state]);

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);

    const redirectTo = location.state?.redirectTo;
    const checkoutState = location.state?.checkoutState;

    if (authenticatedUser?.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (redirectTo) {
      navigate(redirectTo, {
        state: checkoutState,
        replace: true,
      });
      return;
    }

    navigate("/user-dashboard", { replace: true });
  };

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
      setResendTimer(OTP_RESEND_SECONDS);
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

  const handleResendOtp = async () => {
    setError("");
    setMessage("");

    if (!form.email || resendTimer > 0) {
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/auth/login/send-otp`, {
        email: form.email,
      });

      setForm((prev) => ({ ...prev, otp: ["", "", "", "", "", ""] }));
      setOtpSent(true);
      setResendTimer(OTP_RESEND_SECONDS);
      setMessage(res.data.message || "A new OTP has been sent to your email");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to resend login OTP. Please try again.";

      setError(msg);
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
      window.dispatchEvent(new Event("authchange"));

      setMessage(res.data.message || "Login successful");
      setAuthenticatedUser(res.data.user || null);
      setShowSuccessPopup(true);
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

  const currentSlide = loginSlides[activeSlide];
  const SlideIcon = currentSlide.icon;

  return (
    <>
      {showSuccessPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.22)] sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
              ✓
            </div>
            <h3 className="mt-5 text-2xl font-bold text-slate-900">
              Login Successful
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Your account login is complete. Press OK to continue.
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
                <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full shadow-inner ${currentSlide.bg}`}>
                  <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ${currentSlide.accent}`}>
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

            <div className="flex items-center justify-center px-5 py-3 sm:px-7 lg:px-10">
              <div className="w-full max-w-md">
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl font-extrabold text-slate-900 sm:text-[38px]">
                    Login
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Sign in to continue.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
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
                  className="mt-5"
                >
                  <form
                    onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                    className="space-y-4"
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

                        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-500">
                            {resendTimer > 0
                              ? `Resend OTP in ${resendTimer}s`
                              : "Didn't receive the OTP?"}
                          </span>
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={loading || resendTimer > 0}
                            className="font-semibold text-[#87CEEB] transition hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
                          >
                            Resend OTP
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#87CEEB] px-5 text-sm font-bold text-white transition hover:bg-[#6EC6E8] disabled:cursor-not-allowed disabled:opacity-70"
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

                <p className="mt-5 text-center text-sm text-slate-500">
                  New on Gurunanak?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-[#87CEEB] hover:underline"
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
    </>
  );
};

export default Login;
