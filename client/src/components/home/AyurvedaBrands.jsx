import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ayurvedaBrands } from "../../data/brands";
import SectionHeader from "../common/SectionHeader";

const AyurvedaBrands = () => {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const container = trackRef.current;
    if (!container) return undefined;

    let frame;
    let position = 0;
    const speed = 0.35;

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

  const items = [...ayurvedaBrands, ...ayurvedaBrands];

  return (
    <section className="bg-white py-2 sm:py-3 lg:py-4">
      <div className="container-padded">
        <SectionHeader title="Ayurveda top brands" showSeeAll={false} />

        <div
          className="relative mt-1"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent sm:w-12" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent sm:w-12" />

          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide"
          >
            {items.map((brand, index) => (
              <button
                key={`${brand.id}-${index}`}
                type="button"
                onClick={() =>
                  navigate(`/products?${new URLSearchParams({ brand: brand.name }).toString()}`)
                }
                className="flex h-28 w-32 flex-shrink-0 flex-col items-center justify-center gap-2 p-1.5 text-center cursor-pointer transition-all duration-500 ease-out hover:-translate-y-0.5"
              >
                <div className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ${brand.bg} shadow-sm`}>
                  <img
                    src={brand.image}
                    alt={brand.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = brand.fallbackImage;
                    }}
                    className="h-11 w-11 object-contain"
                  />
                </div>
                <span className="line-clamp-2 text-xs font-semibold leading-tight text-textMain">
                  {brand.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AyurvedaBrands;
