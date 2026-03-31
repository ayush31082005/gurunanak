import PageHero from "../components/common/PageHero";
import PrescriptionUploadCard from "../components/pharmacy/PrescriptionUploadCard";

const PrescriptionUpload = () => {
  return (
    <section className="min-h-screen bg-[#f6f7fb] py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <PageHero
            title="Prescription Upload"
            description="This page is ready for backend integration. Connect it with your medicine order flow or pharmacist review system."
          />

          <section className="bg-transparent py-10">
            <div className="container-padded">
              <PrescriptionUploadCard />
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default PrescriptionUpload;