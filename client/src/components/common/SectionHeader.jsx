import { Link } from "react-router-dom";

const SectionHeader = ({
  title,
  showSeeAll = true,
  to = "/products",
  align = "center", // "center" | "left"
}) => {
  return (
    <div
      className={`mb-6 flex w-full flex-col gap-3 ${align === "center"
          ? "items-center text-center"
          : "items-start text-left"
        } sm:flex-row sm:items-center sm:justify-between`}
    >
      {/* Title */}
      <div className="relative">
        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl lg:text-3xl">
          {title}
        </h2>

        {/* Underline */}
        <span
          className={`mt-2 block h-[3px] rounded-full bg-orange-500 ${align === "center" ? "mx-auto w-20" : "w-16"
            }`}
        />
      </div>

      {/* See All Button */}
      {showSeeAll && (
        <Link
          to={to}
          className="inline-flex items-center gap-1 rounded-full border border-orange-500 px-4 py-1.5 text-sm font-semibold text-orange-500 transition-all hover:bg-orange-50 hover:gap-2"
        >
          See all
          <span className="text-base">›</span>
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;