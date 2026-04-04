import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShieldCheck, Truck, BadgePercent } from "lucide-react";
import Button from "../common/Button";

const slides = [
  {
    badge: "Limited Offer",
    title: "Get Upto",
    highlight: "40% OFF",
    subtitle: "on Health & Wellness Products",
    description:
      "Order medicines, vitamins, supplements and daily healthcare essentials from your trusted online pharmacy.",
    image:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1200&q=80",
    cardTitle: "Fast Delivery",
    cardText: "Medicines at your doorstep",
  },
  {
    badge: "Prescription Care",
    title: "Save Upto",
    highlight: "25% OFF",
    subtitle: "on Medicines & Prescription Orders",
    description:
      "Upload prescription, choose trusted medicines and get quality healthcare products at affordable prices.",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    cardTitle: "Trusted Medicines",
    cardText: "Authentic & safe pharmacy products",
  },
  {
    badge: "Lab Tests",
    title: "Book Upto",
    highlight: "70% OFF",
    subtitle: "on Diagnostic & Pathology Tests",
    description:
      "Book health checkups, pathology tests and preventive screenings with easy online scheduling and reports.",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    cardTitle: "Health Packages",
    cardText: "Affordable lab test bookings",
  },
];

const HeroBanner = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setActive((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[active];

  return (
    <section className="relative overflow-hidden">
      <div
        className="relative min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${slide.image})` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-slate-900/35" />

        {/* Decorative Blur */}
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col items-center justify-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          {/* Left Content */}
          <div className="w-full max-w-2xl text-center lg:text-left">
            {/* <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur-sm sm:text-sm">
              {slide.badge}
            </span> */}

            <h1 className="mt-5 text-[2.1rem] font-extrabold leading-tight text-white sm:text-[2.7rem] md:text-[3.15rem] lg:text-[3.5rem] xl:text-[3.9rem]">
              {slide.title}{" "}
              <span className="text-cyan-300">{slide.highlight}</span>
              <br />
              <span className="text-white">{slide.subtitle}</span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base lg:mx-0 lg:text-[17px]">
              {slide.description}
            </p>

            {/* Buttons */}
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <Link to="/products">
                <Button
                  variant="primary"
                  size="lg"
                  className="!rounded-full !bg-white !px-7 !py-3 !text-slate-900 hover:!bg-slate-100"
                >
                  Shop Now
                </Button>
              </Link>

              <Link to="/upload-prescription">
                <Button
                  variant="outline"
                  size="lg"
                  className="!rounded-full !border !border-white !bg-transparent !px-7 !py-3 !text-white hover:!bg-white/10"
                >
                  Upload Prescription
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur-sm lg:justify-start">
                <ShieldCheck size={18} className="text-cyan-300" />
                <span className="text-sm font-medium">100% Genuine</span>
              </div>

              <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur-sm lg:justify-start">
                <Truck size={18} className="text-cyan-300" />
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>

              <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur-sm lg:justify-start">
                <BadgePercent size={18} className="text-cyan-300" />
                <span className="text-sm font-medium">Best Discounts</span>
              </div>
            </div>

          </div>

        </div>

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 md:flex"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 md:flex"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default HeroBanner;
