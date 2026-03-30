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
            className={`flex-shrink-0 w-36 h-24 ${brand.bg} border-[1.5px] border-gray-200 rounded-card flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-primary p-3`}
          >
            <span className="text-3xl">{brand.icon}</span>
            <span className="text-small font-semibold text-textMain text-center leading-tight">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AyurvedaBrands;
