import { useNavigate } from "react-router-dom";

const quickServiceCards = [
  {
    title: "Products",
    to: "/products",
    border: "border-sky-100",
    image:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Reorder",
    to: "/user-dashboard?tab=orders",
    border: "border-amber-100",
    image:
      "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Re-Prescription",
    to: "/user-dashboard?tab=prescription",
    border: "border-violet-100",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Medicine Reminder",
    to: "/reminder",
    border: "border-emerald-100",
    image:
      "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Return Medicine",
    to: "/returns",
    border: "border-rose-100",
    image:
      "https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=900&q=80",
  },
];

const QuickPharmacyServices = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] py-5 sm:py-7 lg:py-8">
      <div className="container-padded">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {quickServiceCards.map((card) => (
            <button
              key={card.title}
              type="button"
              aria-label={card.title}
              title={card.title}
              onClick={() => navigate(card.to)}
              className={`group relative h-[110px] w-[145px] overflow-hidden rounded-[22px] border bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.14)] sm:h-[125px] sm:w-[165px] lg:h-[135px] lg:w-[175px] ${card.border}`}
            >
              <img
                src={card.image}
                alt={card.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/35 transition-colors duration-300 group-hover:bg-slate-900/45" />
              <div className="absolute inset-0 flex items-center justify-center p-3">
                <span className="text-center text-sm font-bold leading-5 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] sm:text-[15px]">
                  {card.title}
                </span>
              </div>
              <span className="sr-only">{card.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickPharmacyServices;
