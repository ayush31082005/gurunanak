import {
  Clock3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  SOCIAL_LINKS,
  SUPPORT_ADDRESS,
  SUPPORT_EMAIL,
  SUPPORT_HOURS,
  SUPPORT_PHONE,
} from "../../utils/constants";

const quickLinks = [
  { label: "About Us", to: "/about-us" },
  { label: "Upload Prescription", to: "/upload-prescription" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Return Policy", to: "/return-policy" },
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Privacy Policy", to: "/privacy-policy" },
];

const categoryLinks = [
  { label: "Vitamins", to: "/vitamins-nutrition" },
  { label: "Hair Care", to: "/hair-care" },
  { label: "Fitness & Health", to: "/fitness-health" },
  { label: "Immunity Boosters", to: "/immunity-boosters" },
  { label: "Homeopathy", to: "/homeopathy" },
  { label: "Pet Care", to: "/pet-care" },
];

const Footer = () => {
  return (
    <footer className="bg-darkFoot text-gray-400">
      <div className="container-padded pt-12 pb-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr_1.2fr] lg:gap-10">
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <span className="font-heading text-xl font-extrabold text-white">
                GURUNANAK
              </span>
            </div>
            <p className="max-w-xs text-body leading-relaxed">
              Your trusted online pharmacy. Genuine medicines and health products
              across India delivered with care.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-body-lg font-bold text-white">
              Quick Links
            </h4>
            <div className="space-y-2.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="block text-body text-gray-400 transition-colors hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-body-lg font-bold text-white">
              Categories
            </h4>
            <div className="space-y-2.5">
              {categoryLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="block text-body text-gray-400 transition-colors hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="col-span-2 text-left lg:col-span-1">
            <h4 className="mb-4 font-heading text-body-lg font-bold text-white">
              Contact Us
            </h4>

            <div className="pt-1">
              <div className="space-y-3 text-sm text-slate-200">
                <a
                  href={`tel:${SUPPORT_PHONE.replace(/\D/g, "")}`}
                  className="flex items-start gap-3 transition-colors hover:text-white"
                >
                  <Phone size={16} className="mt-0.5 shrink-0 text-[#5FC3E7]" />
                  <span>{SUPPORT_PHONE}</span>
                </a>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-start gap-3 break-all transition-colors hover:text-white"
                >
                  <Mail size={16} className="mt-0.5 shrink-0 text-[#5FC3E7]" />
                  <span>{SUPPORT_EMAIL}</span>
                </a>

                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#5FC3E7]" />
                  <span>{SUPPORT_ADDRESS}</span>
                </div>

                <div className="flex items-start gap-3">
                  <Clock3 size={16} className="mt-0.5 shrink-0 text-[#5FC3E7]" />
                  <span>{SUPPORT_HOURS}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {SOCIAL_LINKS.map((item) => {
                  return (
                  <a
                    key={item.label}
                    href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-500/70 bg-slate-800/60 text-slate-200 transition hover:border-[#5FC3E7] hover:bg-[#87CEEB] hover:text-white"
                    title={item.label}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="h-5 w-5 object-contain"
                    />
                  </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-700 pt-4 text-center text-slate-300">
          <div className="text-base font-medium tracking-[0.01em] text-slate-200 sm:text-lg">
            &copy; 2026 Gurunanak Pharmacy. Genuine medicines and trusted care across India.
          </div>
          <div className="mt-1 text-sm font-normal text-slate-400 sm:text-base">
            Created by AI GROWTH EXA
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
