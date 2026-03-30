const PageHero = ({ title, description }) => (
    <section className="bg-gradient-to-r from-primary to-blue-700 py-12 md:py-16">
        <div className="container-padded text-center text-white">
            <h1 className="text-h1 font-heading font-bold mb-3">{title}</h1>
            <p className="text-body-lg text-white/90 max-w-2xl mx-auto">{description}</p>
        </div>
    </section>
);

export default PageHero;
