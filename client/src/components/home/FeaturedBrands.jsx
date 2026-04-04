import { useEffect, useRef, useState } from "react";
import { featuredBrands } from "../../data/brands";
import SectionHeader from "../common/SectionHeader";

const FeaturedBrands = () => {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const items = [...featuredBrands, ...featuredBrands];

  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;

    let frame;
    const speed = 0.3;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const loopPoint = maxScroll / 2;
    let position = loopPoint;

    container.scrollLeft = position;

    const animate = () => {
      if (!isPaused) {
        position -= speed;

        if (position <= 0) {
          position = loopPoint;
        }

        container.scrollLeft = position;
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isPaused]);

  return (
    <section className="bg-[#f8fafc] py-3 sm:py-5 lg:py-6">
      <div className="container-padded">
        <SectionHeader title="Featured brands" showSeeAll={false} />

        <div
          className="relative mt-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* left fade */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-[#f8fafc] to-transparent sm:w-16" />

          {/* right fade */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-[#f8fafc] to-transparent sm:w-16" />

          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide"
          >
            {items.map((brand, index) => (
              <div
                key={`${brand.id}-${index}`}
                className="group flex min-w-[108px] flex-shrink-0 flex-col items-center sm:min-w-[126px] md:min-w-[140px]"
              >
                {/* Card */}
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-sm transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-hover:shadow-md sm:h-24 sm:w-24 sm:p-2 md:h-28 md:w-28 md:p-2.5">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-white">
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="max-h-full max-w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                {/* Name */}
                <p className="mt-2 max-w-[92px] text-center text-xs font-semibold text-slate-800 sm:max-w-[108px] sm:text-[13px] md:text-sm">
                  {brand.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBrands;
