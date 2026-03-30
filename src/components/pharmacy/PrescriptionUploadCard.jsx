import Button from "../common/Button";

const steps = [
  "Upload clear prescription image",
  "Our pharmacist verifies medicine details",
  "You receive a call for order confirmation",
  "Medicines are packed and delivered safely",
];

const PrescriptionUploadCard = () => {
  return (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
      <div className="bg-white rounded-card border border-gray-200 p-6 shadow-card">
        <h2 className="text-h2 font-bold text-textMain">Upload prescription</h2>
        <p className="mt-2 text-body text-gray-600">This setup includes a frontend-ready prescription upload block. You can connect it to your backend or cloud storage later.</p>

        <div className="mt-6 rounded-card border-2 border-dashed border-primary/30 bg-blue-50 p-8 text-center">
          <div className="text-5xl">📄</div>
          <p className="mt-3 text-body font-medium">Drag & drop prescription here</p>
          <p className="mt-1 text-small text-gray-500">JPG, PNG or PDF up to 5MB</p>
          <Button className="mt-5">Choose File</Button>
        </div>
      </div>

      <div className="bg-white rounded-card border border-gray-200 p-6 shadow-card">
        <h3 className="text-h3 font-bold text-textMain">How it works</h3>
        <div className="mt-5 space-y-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-primary text-white text-small font-semibold inline-flex items-center justify-center flex-shrink-0">{index + 1}</span>
              <p className="text-body text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUploadCard;
