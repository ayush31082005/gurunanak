import React from "react";
import {
  BadgeCheck,
  FileText,
  HeartHandshake,
  Lock,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import {
  SUPPORT_ADDRESS,
  SUPPORT_EMAIL,
  SUPPORT_HOURS,
  SUPPORT_PHONE,
} from "../../utils/constants";

const termsCards = [
  {
    icon: <FileText size={22} />,
    title: "Using Our Platform",
    desc:
      "By using Gurunanak Pharmacy, you agree to provide accurate details, use the website lawfully, and follow all product and prescription requirements shown on the platform.",
  },
  {
    icon: <ReceiptText size={22} />,
    title: "Orders & Payments",
    desc:
      "Orders are confirmed only after successful review, availability checks, and payment or COD approval. Prices, offers, and stock may change without prior notice.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Prescription Products",
    desc:
      "Prescription medicines may require valid doctor prescriptions, internal verification, and additional checks before dispatch. We reserve the right to reject non-compliant orders.",
  },
  {
    icon: <Lock size={22} />,
    title: "Account Responsibility",
    desc:
      "You are responsible for maintaining the confidentiality of your login details and for activities performed through your account on our website.",
  },
];

const keyPoints = [
  "Users must share correct contact, delivery, and medical information wherever required.",
  "Product images and descriptions are for general guidance and may vary slightly from delivered packaging.",
  "Delivery timelines depend on service area, prescription validation, stock availability, and logistics conditions.",
  "Returns, refunds, privacy handling, and shipping are also governed by their respective policy pages.",
  "Misuse of the website, fraud, abusive behavior, or unlawful activity may result in order cancellation or account restrictions.",
];

const TermsConditions = () => {
  return (
    <section className="min-h-screen bg-[#f8fafc] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-[#fff8ed] via-white to-[#f8fbff]">
          <div className="grid items-center gap-8 px-6 py-10 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-600">
                <BadgeCheck size={16} />
                Terms & Conditions
              </div>

              <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Website Terms for
                <br />
                <span className="text-[#87CEEB]">Gurunanak Pharmacy</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                These Terms and Conditions explain the rules for browsing,
                ordering, uploading prescriptions, making payments, and using
                customer support services on Gurunanak Pharmacy.
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                By continuing to use this website, you agree to these terms
                along with our privacy, shipping, and return policies.
              </p>
            </div>

            <div className="p-2">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF9FE] text-[#87CEEB]">
                  <HeartHandshake size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Need policy support?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Our support team can help with account questions, order
                    issues, policy clarifications, and prescription-related
                    assistance.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-sm text-slate-700">
                <p>Phone: {SUPPORT_PHONE}</p>
                <p>Email: {SUPPORT_EMAIL}</p>
                <p>Address: {SUPPORT_ADDRESS}</p>
                <p>Support Hours: {SUPPORT_HOURS}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {termsCards.map((item) => (
            <div key={item.title} className="p-2">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF9FE] text-[#87CEEB]">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-1 sm:p-2">
          <h2 className="text-2xl font-bold text-slate-900">Important Terms</h2>
          <div className="mt-5 grid gap-3">
            {keyPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 border-l-2 border-[#87CEEB] pl-4 text-sm text-slate-700">
                <span className="mt-0.5 text-[#87CEEB]">
                  <ShieldCheck size={16} />
                </span>
                <p className="leading-6">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsConditions;
