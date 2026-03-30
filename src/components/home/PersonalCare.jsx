import { personalCareCategories } from "../../data/brands";
import SectionHeader from "../common/SectionHeader";

const PersonalCare = () => (
  <section className="py-10 bg-white">
    <div className="container-padded">
      <SectionHeader title="Personal care" showSeeAll={false} />
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {personalCareCategories.map((cat) => (
          <div
            key={cat.id}
            className={`flex-shrink-0 w-44 h-40 bg-gradient-to-br ${cat.gradient} rounded-card flex flex-col justify-between p-5 cursor-pointer transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-md`}
          >
            <span className="font-heading font-bold text-h3 text-white">{cat.label}</span>
            <div className="self-end h-20 w-20 overflow-hidden rounded-2xl border border-white/30 bg-white/15 p-1.5 backdrop-blur-sm">
              <img
                src={cat.image}
                alt={cat.label}
                loading="lazy"
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PersonalCare;
