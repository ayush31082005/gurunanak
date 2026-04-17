import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
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
        relatedTitle: "Related to Diabetes",
        relatedPoints: [
            "Common symptoms include increased thirst, frequent urination, weakness, and blurred vision.",
            "Helpful care tips include regular sugar monitoring, a balanced diet, walking daily, and taking medicines on time.",
            "Consult a doctor if sugar levels remain very high, dizziness increases, or wound healing becomes slow.",
        ],
    },
    {
        id: 2,
        title: "High Blood Pressure",
        type: "disease",
        category: "All Diseases",
        description: "Understand hypertension and how to manage it effectively.",
        relatedTitle: "Related to High Blood Pressure",
        relatedPoints: [
            "Risk signs may include headache, chest discomfort, anxiety, and dizziness.",
            "Daily care should focus on a low-salt diet, stress control, regular blood pressure checks, and timely medication.",
            "Seek immediate medical help if blood pressure rises suddenly with chest pain or shortness of breath.",
        ],
    },
    {
        id: 3,
        title: "Fever",
        type: "disease",
        category: "All Diseases",
        description: "Basic information about common fever and home care guidance.",
        relatedTitle: "Related to Fever",
        relatedPoints: [
            "Common causes include viral infections, seasonal illness, or body inflammation.",
            "Home care usually includes hydration, rest, light meals, and regular temperature monitoring.",
            "See a doctor if fever lasts more than two to three days, breathing issues appear, or body pain becomes severe.",
        ],
    },
];

const medicineData = [
    {
        id: 4,
        title: "Paracetamol",
        type: "medicine",
        category: "All Medicines",
        description: "Used for fever and mild to moderate pain relief.",
        relatedTitle: "Related to Paracetamol",
        relatedPoints: [
            "It is commonly used for fever reduction and mild to moderate pain relief.",
            "Always take the dose according to medical advice or the product label, and avoid overuse.",
            "People with liver concerns should use it only after proper medical guidance.",
        ],
    },
    {
        id: 5,
        title: "Azithromycin",
        type: "medicine",
        category: "All Medicines",
        description: "Antibiotic medicine used in bacterial infections.",
        relatedTitle: "Related to Azithromycin",
        relatedPoints: [
            "This antibiotic is used for bacterial infections and is not suitable for every cold or cough.",
            "It is important to complete the full course and not stop midway.",
            "Avoid using antibiotics without a valid prescription.",
        ],
    },
    {
        id: 6,
        title: "Cetirizine",
        type: "medicine",
        category: "All Medicines",
        description: "Common medicine used for allergy relief.",
        relatedTitle: "Related to Cetirizine",
        relatedPoints: [
            "It is commonly used to relieve allergy symptoms such as sneezing, itching, and runny nose.",
            "Some people may feel sleepy after taking it, so monitor how your body responds.",
            "If symptoms keep returning, identifying the allergy trigger can be very helpful.",
        ],
    },
];

const therapeuticClassData = [
    {
        id: 7,
        title: "Analgesics",
        type: "class",
        category: "Medicines by Therapeutic Class",
        description: "Pain relief medicines including non-opioid options.",
        relatedTitle: "Related to Analgesics",
        relatedPoints: [
            "This is a class of pain-relief medicines used for headache, body pain, and injury-related discomfort.",
            "Not every painkiller is safe for every patient, especially in people with kidney or stomach issues.",
            "For long-term pain, medical consultation is better than repeated self-medication.",
        ],
    },
    {
        id: 8,
        title: "Antibiotics",
        type: "class",
        category: "Medicines by Therapeutic Class",
        description: "Medicines used for treating bacterial infections.",
        relatedTitle: "Related to Antibiotics",
        relatedPoints: [
            "These medicines treat bacterial infections and are not directly useful for viral flu or the common cold.",
            "Using the wrong antibiotic or leaving a course incomplete can increase antibiotic resistance.",
            "The safest approach is to use antibiotics only with a prescription.",
        ],
    },
    {
        id: 9,
        title: "Antihistamines",
        type: "class",
        category: "Medicines by Therapeutic Class",
        description: "Used for allergy, sneezing, itching, and cold symptoms.",
        relatedTitle: "Related to Antihistamines",
        relatedPoints: [
            "They are used to manage allergy symptoms such as sneezing, itching, and watery eyes.",
            "Some antihistamines may cause drowsiness, so timing and daily routine matter.",
            "If allergies keep recurring, identifying the cause can help with long-term relief.",
        ],
    },
];

const allResources = [...diseaseData, ...medicineData, ...therapeuticClassData];

const HealthResourceCenter = () => {
    const [searchParams] = useSearchParams();
    const [selectedFilter, setSelectedFilter] = useState("All Diseases");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);

    useEffect(() => {
        const filterFromQuery = searchParams.get("filter");

        if (filterFromQuery && filterOptions.includes(filterFromQuery)) {
            setSelectedFilter(filterFromQuery);
            return;
        }

        setSelectedFilter("All Diseases");
    }, [searchParams]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                setSelectedResource(null);
            }
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const filteredData = useMemo(() => {
        return allResources.filter((item) => {
            return item.category === selectedFilter;
        });
    }, [selectedFilter]);

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
                                                        ? "bg-orange-50 text-[#87CEEB]"
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
                                    Try changing the selected filter.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredData.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="mb-3 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#87CEEB]">
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
                                            onClick={() => setSelectedResource(item)}
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

            {selectedResource ? (
                <>
                    <div
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
                        onClick={() => setSelectedResource(null)}
                    />

                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div className="w-full max-w-[560px] rounded-[28px] bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.22)] sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#87CEEB]">
                                        {selectedResource.type === "disease"
                                            ? "Disease"
                                            : selectedResource.type === "medicine"
                                                ? "Medicine"
                                                : "Therapeutic Class"}
                                    </span>
                                    <h3 className="mt-3 text-2xl font-bold text-slate-900">
                                        {selectedResource.title}
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedResource(null)}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="mt-4 text-sm leading-7 text-slate-600">
                                {selectedResource.description}
                            </p>

                            <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                                <h4 className="text-base font-bold text-slate-900">
                                    {selectedResource.relatedTitle || `Related to ${selectedResource.title}`}
                                </h4>

                                <div className="mt-4 space-y-3">
                                    {(selectedResource.relatedPoints || []).map((point) => (
                                        <div
                                            key={point}
                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600"
                                        >
                                            {point}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </section>
    );
};

export default HealthResourceCenter;
