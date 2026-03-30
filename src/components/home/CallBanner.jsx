import { Phone, X } from "lucide-react";
import { useState } from "react";

const CallBanner = () => {
  const [visible, setVisible] = useState(true);
  const [phone, setPhone] = useState("");

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] backdrop-blur-md sm:px-4">
      <div className="mx-auto max-w-[1280px]">
        <div className="relative rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-sm sm:px-4 lg:px-5">
          {/* Close Button */}
          <button
            onClick={() => setVisible(false)}
            className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close call banner"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Content */}
            <div className="flex min-w-0 items-start gap-3 pr-8 lg:max-w-[48%]">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Phone size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 sm:text-base">
                  Order Medicines on Call
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-600 sm:text-sm">
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
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              {/* Phone Input */}
              <div className="flex h-12 w-full items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 focus-within:border-orange-500 focus-within:bg-white sm:flex-1 lg:w-[280px]">
                <span className="text-sm font-medium text-slate-500">IN</span>
                <span className="text-sm text-slate-400">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              {/* CTA Button */}
              <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto sm:min-w-[220px]">
                <Phone size={16} />
                <span>Get a Call Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallBanner;