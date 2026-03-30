import PageHero from "../components/common/PageHero";
import PrescriptionUploadCard from "../components/pharmacy/PrescriptionUploadCard";

const PrescriptionUpload = () => {
  return (
    <>
      <PageHero
        title="Prescription Upload"
        description="This page is ready for backend integration. Connect it with your medicine order flow or pharmacist review system."
      />
      <section className="py-10 bg-bg">
        <div className="container-padded">
          <PrescriptionUploadCard />
        </div>
      </section>
    </>
  );
};

export default PrescriptionUpload;
