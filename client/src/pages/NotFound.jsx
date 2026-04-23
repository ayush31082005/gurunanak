import { Link } from "react-router-dom";
import PageHero from "../components/common/PageHero";

const NotFound = () => {
  return (
    <>
      <PageHero title="Page not found" description="The page you are looking for does not exist." />
      <section className="py-10 bg-bg">
        <div className="container-padded">
          <Link to="/" className="inline-flex rounded-pill bg-primary text-white px-5 py-3 font-heading font-semibold hover:bg-[#0284C7] transition-colors">
            Go back home
          </Link>
        </div>
      </section>
    </>
  );
};

export default NotFound;
