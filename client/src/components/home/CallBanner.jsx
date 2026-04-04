import { Phone, X } from "lucide-react";
import { useState } from "react";
import API from "../../api";

const CallBanner = () => {
  const [visible, setVisible] = useState(true);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const normalizedPhone = phone.replace(/\D/g, "").slice(0, 10);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setIsSubmitting(true);

      const storedUser = localStorage.getItem("user");
      let parsedUser = null;

      try {
        parsedUser = storedUser ? JSON.parse(storedUser) : null;
      } catch {
        parsedUser = null;
      }

      const { data } = await API.post("/contact/callback", {
        phone: normalizedPhone,
        email: parsedUser?.email || "",
        source: window.location.pathname || "website",
      });

      if (data.success) {
        alert("Callback request sent successfully");
        setPhone("");
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to send callback request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] backdrop-blur-md sm:px-3">
      <div className="mx-auto max-w-[1280px]">
        <div className="relative rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4 lg:px-4">
          {/* Close Button */}
          <button
            onClick={() => setVisible(false)}
            className="absolute right-2 top-2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close call banner"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Content */}
            <div className="flex min-w-0 items-start gap-2.5 pr-6 lg:max-w-[48%]">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Phone size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 sm:text-sm">
                  Order Medicines on Call
                </p>
                <p className="mt-0.5 text-[11px] leading-5 text-slate-600 sm:text-xs">
                  Call us at{" "}
                  <a
                    href="tel:18002122323"
                    className="font-semibold text-orange-600 hover:underline"
                  >
                    1800-212-2323
                  </a>{" "}
                  or request a callback from our support team.
                </p>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
              {/* Phone Input */}
              <div className="flex h-10 w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 focus-within:border-orange-500 focus-within:bg-white sm:flex-1 lg:w-[250px]">
                <span className="text-xs font-medium text-slate-500">IN</span>
                <span className="text-xs text-slate-400">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                  placeholder="Enter phone number"
                  className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* CTA Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#ff6f61] px-4 text-xs font-semibold text-white transition hover:bg-[#f45d4f] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[190px]"
              >
                <Phone size={14} />
                <span>{isSubmitting ? "Sending..." : "Get a Call Back"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallBanner;
