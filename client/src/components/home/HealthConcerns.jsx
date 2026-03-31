import { useEffect, useRef, useState } from "react";
import { healthConcerns } from "../../data/brands";
import SectionHeader from "../common/SectionHeader";

const HealthConcerns = () => {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

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
    <section className="bg-white py-10 sm:py-12 lg:py-14">
      <div className="container-padded">
        <SectionHeader title="Shop by health concerns" showSeeAll={false} />

        <div
          className="relative mt-6"
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
            className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
          >
            {items.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="group flex min-w-[120px] flex-shrink-0 flex-col items-center sm:min-w-[135px] md:min-w-[150px]"
              >
                <div
                  className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border p-1.5 shadow-sm transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-hover:shadow-md sm:h-28 sm:w-28 sm:p-2 md:h-32 md:w-32 md:p-2.5 ${item.bg} ${item.border}`}
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

                <p className="mt-3 max-w-[100px] text-center text-sm font-semibold leading-5 text-slate-800 sm:max-w-[120px] sm:text-[15px]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthConcerns;
