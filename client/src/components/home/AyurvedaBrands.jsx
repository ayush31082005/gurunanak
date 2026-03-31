import { useEffect, useRef, useState } from "react";
import { ayurvedaBrands } from "../../data/brands";
import SectionHeader from "../common/SectionHeader";

const AyurvedaBrands = () => {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateView = () => setIsMobileView(mediaQuery.matches);

    updateView();
    mediaQuery.addEventListener("change", updateView);

    return () => mediaQuery.removeEventListener("change", updateView);
  }, []);

  useEffect(() => {
    if (!isMobileView) return undefined;

    const container = trackRef.current;
    if (!container) return undefined;

    let frame;
    const speed = 0.35;
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
  }, [isMobileView, isPaused]);

  const items = isMobileView ? [...ayurvedaBrands, ...ayurvedaBrands] : ayurvedaBrands;

  return (
    <section className="bg-white py-10">
      <div className="container-padded">
        <SectionHeader title="Ayurveda top brands" showSeeAll={false} />

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {isMobileView ? (
            <>
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent" />
            </>
          ) : null}

          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          >
            {items.map((brand, index) => (
              <div
                key={`${brand.id}-${index}`}
                className="flex h-32 w-36 flex-shrink-0 flex-col items-center justify-center gap-3 p-2 text-center cursor-pointer transition-all duration-500 ease-out hover:-translate-y-0.5"
              >
                <div className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ${brand.bg} shadow-sm`}>
                  <img
                    src={brand.image}
                    alt={brand.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = brand.fallbackImage;
                    }}
                    className="h-14 w-14 object-contain"
                  />
                </div>
                <span className="line-clamp-2 text-sm font-semibold leading-tight text-textMain">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AyurvedaBrands;
