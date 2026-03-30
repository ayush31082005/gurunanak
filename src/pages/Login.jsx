import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Smartphone,
  Lock,
  ShieldCheck,
  ArrowRight,
  Stethoscope,
} from "lucide-react";

const Login = () => {
  const [loginType, setLoginType] = useState("email");
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    mobile: "",
    otp: ["", "", "", ""],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...form.otp];
    updatedOtp[index] = value;
    setForm((prev) => ({ ...prev, otp: updatedOtp }));

    if (value && index < 3) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !form.otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    console.log("Email login:", {
      email: form.email,
      password: form.password,
    });
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!form.mobile) return;
    setOtpSent(true);
    console.log("OTP sent to:", form.mobile);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    console.log("Verify OTP:", form.mobile, form.otp.join(""));
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/95 to-cyan-950/90" />

      {/* Decorative blur */}
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden text-white lg:block"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
            <ShieldCheck size={16} className="text-cyan-300" />
            Secure pharmacy account access
          </div>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight xl:text-5xl">
            Welcome back to <span className="text-cyan-300">MediShop Rx</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            Login to manage orders, prescriptions, saved addresses, health
            essentials and quick reorders with a smooth and secure experience.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
              <Stethoscope className="text-cyan-300" size={22} />
              <h3 className="mt-3 text-lg font-bold">Trusted Care</h3>
              <p className="mt-2 text-sm text-slate-300">
                Access prescriptions, orders and wellness products in one place.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
              <ShieldCheck className="text-cyan-300" size={22} />
              <h3 className="mt-3 text-lg font-bold">Safe Login</h3>
              <p className="mt-2 text-sm text-slate-300">
                Sign in using email or mobile OTP with a clean responsive flow.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right card */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="rounded-[28px] border border-white/10 bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                <ShieldCheck size={24} />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Login
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Choose your preferred login method
              </p>
            </div>

            {/* Tabs */}
            <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5">
              <button
                onClick={() => {
                  setLoginType("email");
                  setOtpSent(false);
                }}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${loginType === "email"
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-500"
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </span>
              </button>

              <button
                onClick={() => setLoginType("mobile")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${loginType === "mobile"
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-500"
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Smartphone size={16} />
                  Mobile OTP
                </span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {loginType === "email" ? (
                <motion.form
                  key="email-login"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleEmailSubmit}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
                      <Mail size={18} className="text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full bg-transparent px-3 py-4 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
                      <Lock size={18} className="text-slate-400" />
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="w-full bg-transparent px-3 py-4 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-600">
                      <input type="checkbox" className="rounded" />
                      Remember me
                    </label>
                    <Link
                      to="/forgot-password"
                      className="font-semibold text-cyan-700 hover:text-cyan-800"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800"
                  >
                    Login
                    <ArrowRight size={18} />
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="mobile-login"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                  className="mt-6 space-y-4"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Mobile Number
                    </label>
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
                      <Smartphone size={18} className="text-slate-400" />
                      <input
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                        maxLength={10}
                        className="w-full bg-transparent px-3 py-4 text-sm outline-none"
                      />
                    </div>
                  </div>

                  {!otpSent ? (
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800"
                    >
                      Send OTP
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Enter OTP
                        </label>
                        <div className="flex justify-between gap-3">
                          {form.otp.map((digit, index) => (
                            <input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handleOtpChange(index, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className="h-14 w-14 rounded-2xl border border-slate-200 text-center text-lg font-bold outline-none transition focus:border-cyan-500"
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="font-semibold text-slate-500 hover:text-slate-700"
                        >
                          Change number
                        </button>
                        <button
                          type="button"
                          className="font-semibold text-cyan-700 hover:text-cyan-800"
                        >
                          Resend OTP
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800"
                      >
                        Verify OTP
                        <ArrowRight size={18} />
                      </button>
                    </>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-cyan-700 hover:text-cyan-800"
              >
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Login;