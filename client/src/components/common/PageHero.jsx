const PageHero = ({ title, description, crumbs = [], backgroundImage = "" }) => {
    return (
        <section className="relative overflow-hidden border-b border-slate-200 bg-[#fafafa]">
            {backgroundImage ? (
                <>
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                    <div className="absolute inset-0 bg-white/88" />
                </>
            ) : null}

            <div className="container-padded relative py-8 text-center">
                {crumbs.length ? (
                    <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
                        {crumbs.map((crumb, index) => (
                            <span key={`${crumb}-${index}`} className="flex items-center gap-2">
                                <span>{crumb}</span>
                                {index < crumbs.length - 1 ? <span>/</span> : null}
                            </span>
                        ))}
                    </div>
                ) : null}

                <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                    {title}
                </h1>

                {description ? (
                    <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
                        {description}
                    </p>
                ) : null}
            </div>
        </section>
    );
};

export default PageHero;
