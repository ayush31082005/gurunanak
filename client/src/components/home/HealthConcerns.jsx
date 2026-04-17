import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { healthConcerns } from "../../data/brands";
import SectionHeader from "../common/SectionHeader";

const HealthConcerns = () => {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const items = [...healthConcerns, ...healthConcerns];

  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;

    let frame;
    let position = 0;
    const speed = 0.3;

    const animate = () => {
      if (!isPaused) {
        position += speed;

        if (position >= container.scrollWidth / 2) {
          position = 0;
        }

        container.scrollLeft = position;
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isPaused]);

  return (
    <section className="bg-white py-3 sm:py-5 lg:py-6">
      <div className="container-padded">
        <SectionHeader title="Shop by health concerns" showSeeAll={false} />

        <div
          className="relative mt-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* fade left */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 bg-gradient-to-r from-white to-transparent sm:w-16" />

          {/* fade right */}
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-white to-transparent sm:w-16" />

          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide"
          >
            {items.map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                type="button"
                onClick={() =>
                  navigate(`/products?${new URLSearchParams({ concern: item.label }).toString()}`)
                }
                className="group flex min-w-[104px] flex-shrink-0 flex-col items-center sm:min-w-[120px] md:min-w-[132px]"
              >
                <div
                  className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border p-1.5 shadow-sm transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-hover:shadow-md sm:h-24 sm:w-24 sm:p-2 md:h-28 md:w-28 md:p-2 ${item.bg} ${item.border}`}
                >
                  <div className="h-full w-full overflow-hidden rounded-full bg-white">
                    <img
                      src={item.image}
                      alt={item.label}
                      style={{ transform: `scale(${item.zoom || 1.18})` }}
                      className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.16]"
                    />
                  </div>
                </div>

                <p className="mt-2 max-w-[92px] text-center text-xs font-semibold leading-4 text-slate-800 sm:max-w-[108px] sm:text-[13px] md:text-sm">
                  {item.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthConcerns;
