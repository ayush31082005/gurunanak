import { healthConcerns, personalCareCategories } from "../../data/brands";

const CategoryGrid = () => {
  const merged = [
    ...healthConcerns.map((item) => ({ id: `hc-${item.id}`, icon: item.icon, label: item.label, className: `${item.bg} ${item.border}` })),
    ...personalCareCategories.map((item) => ({ id: `pc-${item.id}`, icon: item.icon, label: item.label, className: "bg-white border-gray-200" })),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {merged.map((item) => (
        <div
          key={item.id}
          className={`rounded-card border p-5 flex flex-col items-center justify-center gap-3 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-hover ${item.className}`}
        >
          <span className="text-4xl">{item.icon}</span>
          <span className="text-body font-medium text-textMain">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;
