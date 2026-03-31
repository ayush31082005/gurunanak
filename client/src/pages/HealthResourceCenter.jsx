import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import CategoryHeroBanner from "../components/common/CategoryHeroBanner";

const filterOptions = [
    "All Diseases",
    "All Medicines",
    "Medicines by Therapeutic Class",
];

const diseaseData = [
    {
        id: 1,
        title: "Diabetes",
        type: "disease",
        category: "All Diseases",
        description: "Know symptoms, causes, prevention, and treatment for diabetes.",
    },
    {
        id: 2,
        title: "High Blood Pressure",
        type: "disease",
        category: "All Diseases",
        description: "Understand hypertension and how to manage it effectively.",
    },
    {
        id: 3,
        title: "Fever",
        type: "disease",
        category: "All Diseases",
        description: "Basic information about common fever and home care guidance.",
    },
];

const medicineData = [
    {
        id: 4,
        title: "Paracetamol",
        type: "medicine",
        category: "All Medicines",
        description: "Used for fever and mild to moderate pain relief.",
    },
    {
        id: 5,
        title: "Azithromycin",
        type: "medicine",
        category: "All Medicines",
        description: "Antibiotic medicine used in bacterial infections.",
    },
    {
        id: 6,
        title: "Cetirizine",
        type: "medicine",
        category: "All Medicines",
        description: "Common medicine used for allergy relief.",
    },
];

const therapeuticClassData = [
    {
        id: 7,
        title: "Analgesics",
        type: "class",
        category: "Medicines by Therapeutic Class",
        description: "Pain relief medicines including non-opioid options.",
    },
    {
        id: 8,
        title: "Antibiotics",
        type: "class",
        category: "Medicines by Therapeutic Class",
        description: "Medicines used for treating bacterial infections.",
    },
    {
        id: 9,
        title: "Antihistamines",
        type: "class",
        category: "Medicines by Therapeutic Class",
        description: "Used for allergy, sneezing, itching, and cold symptoms.",
    },
];

const allResources = [...diseaseData, ...medicineData, ...therapeuticClassData];

const HealthResourceCenter = () => {
    const [searchParams] = useSearchParams();
    const [selectedFilter, setSelectedFilter] = useState("All Diseases");
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const filterFromQuery = searchParams.get("filter");

        if (filterFromQuery && filterOptions.includes(filterFromQuery)) {
            setSelectedFilter(filterFromQuery);
            return;
        }

        setSelectedFilter("All Diseases");
    }, [searchParams]);

    const filteredData = useMemo(() => {
        return allResources.filter((item) => {
            const matchesFilter = item.category === selectedFilter;
            const matchesSearch =
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [selectedFilter, searchTerm]);

    return (
        <section className="min-h-screen bg-[#f6f7fb] pt-0 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <CategoryHeroBanner
                        className="-mt-5 sm:-mt-8"
                        eyebrow="Health Library"
                        title="Health Resource Center"
                        description="Doctor-guided disease awareness, medicine information and therapeutic class insights in one searchable hub."
                        image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80"
                    />

                    <div className="relative flex flex-col gap-4 lg:min-h-[92px] lg:justify-center">
                        <div className="text-center">
                            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                                Health Resource Center
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Explore diseases, medicines, and therapeutic classes.
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:flex-row lg:absolute lg:right-0 lg:top-1/2 lg:w-auto lg:-translate-y-1/2 lg:items-center">
                            <div className="relative w-full sm:w-[320px]">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Search resources..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-[#ff6f61]"
                                />
                            </div>

                            <div className="relative w-full sm:w-[280px]">
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen((prev) => !prev)}
                                    className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800"
                                >
                                    <span>{selectedFilter}</span>
                                    <span className="text-slate-400">{dropdownOpen ? "−" : "+"}</span>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute left-0 top-[56px] z-20 w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                                        {filterOptions.map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedFilter(option);
                                                    setDropdownOpen(false);
                                                }}
                                                className={`block w-full px-5 py-4 text-left text-base font-bold transition ${selectedFilter === option
                                                        ? "bg-orange-50 text-[#ff6f61]"
                                                        : "text-slate-900 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">
                                {selectedFilter}
                            </h2>
                            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                                {filteredData.length} items
                            </span>
                        </div>

                        {filteredData.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                                <h3 className="text-lg font-bold text-slate-800">
                                    No results found
                                </h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Try changing the filter or search keyword.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredData.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="mb-3 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#ff6f61]">
                                            {item.type === "disease"
                                                ? "Disease"
                                                : item.type === "medicine"
                                                    ? "Medicine"
                                                    : "Therapeutic Class"}
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900">
                                            {item.title}
                                        </h3>

                                        <p className="mt-3 text-sm leading-6 text-slate-500">
                                            {item.description}
                                        </p>

                                        <button
                                            type="button"
                                            className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                        >
                                            Read More
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HealthResourceCenter;
