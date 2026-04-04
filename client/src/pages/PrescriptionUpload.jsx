import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../components/common/PageHero";
import PrescriptionUploadCard from "../components/pharmacy/PrescriptionUploadCard";

const PrescriptionUpload = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) return;

    navigate("/login", {
      replace: true,
      state: {
        message: "Please login first to upload prescription.",
        redirectTo: "/upload-prescription",
      },
    });
  }, [navigate]);

  return (
    <section className="min-h-screen bg-[#f6f7fb] py-4 sm:py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <PageHero
            title="Prescription Upload"
            description="Upload your prescription securely and our pharmacy team will review it before confirming your order."
          />

          <section className="bg-transparent py-5 sm:py-6">
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
