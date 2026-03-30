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
    <section className="bg-[#f8fafc] py-10 sm:py-12 lg:py-14">
      <div className="container-padded">
        <SectionHeader title="Featured brands" showSeeAll={false} />

        <div
          className="relative mt-6"
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
            className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
          >
            {items.map((brand, index) => (
              <div
                key={`${brand.id}-${index}`}
                className="group flex min-w-[120px] flex-shrink-0 flex-col items-center sm:min-w-[140px] md:min-w-[160px]"
              >
                {/* Card */}
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-sm transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-hover:shadow-md sm:h-28 sm:w-28 sm:p-2.5 md:h-32 md:w-32 md:p-3">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-white">
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="max-h-full max-w-full object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                </div>

                {/* Name */}
                <p className="mt-3 max-w-[100px] text-center text-sm font-semibold text-slate-800 sm:max-w-[120px] sm:text-[15px]">
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
