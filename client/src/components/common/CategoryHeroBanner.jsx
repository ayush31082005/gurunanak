const CategoryHeroBanner = ({
    title,
    description,
    image,
    eyebrow,
    className = "",
    centered = false,
}) => {
    return (
        <div
            className={`relative left-1/2 right-1/2 mb-8 w-screen -translate-x-1/2 overflow-hidden bg-slate-900 ${className}`}
        >
            <img
                src={image}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/65 to-slate-900/20" />

            <div
                className={`relative mx-auto flex min-h-[230px] max-w-[1480px] items-end px-4 py-8 sm:px-6 lg:min-h-[260px] lg:px-8 ${
                    centered ? "justify-center text-center" : ""
                }`}
            >
                <div className={centered ? "max-w-3xl" : "max-w-2xl"}>
                    {eyebrow ? (
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#ffd2cb]">
                            {eyebrow}
                        </p>
                    ) : null}

                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[42px]">
                        {title}
                    </h1>

                    {description ? (
                        <p
                            className={`mt-3 text-sm leading-7 text-slate-100/90 sm:text-base ${
                                centered ? "mx-auto max-w-2xl" : "max-w-xl"
                            }`}
                        >
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default CategoryHeroBanner;
