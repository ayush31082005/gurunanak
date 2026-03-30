import { ayurvedaBrands } from "../../data/brands";
import SectionHeader from "../common/SectionHeader";

const AyurvedaBrands = () => (
  <section className="py-10 bg-white">
    <div className="container-padded">
      <SectionHeader title="Ayurveda top brands" showSeeAll={false} />
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {ayurvedaBrands.map((brand) => (
          <div
            key={brand.id}
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
  </section>
);

export default AyurvedaBrands;
