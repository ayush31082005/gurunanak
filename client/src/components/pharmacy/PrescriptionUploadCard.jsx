import { useRef, useState } from "react";
import Button from "../common/Button";

const steps = [
  "Upload clear prescription image",
  "Our pharmacist verifies medicine details",
  "You receive a call for order confirmation",
  "Medicines are packed and delivered safely",
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const formatFileSize = (size) => {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const PrescriptionUploadCard = () => {
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "mobile") {
      setForm((prev) => ({
        ...prev,
        mobile: value.replace(/\D/g, "").slice(0, 10),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAndStoreFile = (file) => {
    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setError("Please choose a JPG, PNG or PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError("File size must be 5MB or less.");
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    validateAndStoreFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);

    const file = event.dataTransfer.files?.[0];
    validateAndStoreFile(file);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-card border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-h2 font-bold text-textMain">Upload prescription</h2>
        <p className="mt-2 text-body text-gray-600">
          This setup includes a frontend-ready prescription upload block. You can
          connect it to your backend or cloud storage later.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-small font-semibold text-textMain">
              Full name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full rounded-card border border-gray-200 px-4 py-3 outline-none transition focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-small font-semibold text-textMain">
              Mobile number
            </label>
            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
              inputMode="numeric"
              maxLength={10}
              className="w-full rounded-card border border-gray-200 px-4 py-3 outline-none transition focus:border-primary"
            />
          </div>
        </div>

        <div
          className={`mt-6 rounded-card border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? "border-primary bg-blue-100"
              : "border-primary/30 bg-blue-50"
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragActive(false);
          }}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="text-5xl">File</div>
          <p className="mt-3 text-body font-medium">
            Drag and drop prescription here
          </p>
          <p className="mt-1 text-small text-gray-500">
            JPG, PNG or PDF up to 5MB
          </p>

          <Button
            className="mt-5 bg-[#ff6f61] hover:bg-[#f45d4f]"
            onClick={handleChooseFile}
          >
            Choose File
          </Button>

          {selectedFile && (
            <p className="mt-4 text-small font-medium text-green-700">
              Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </p>
          )}

          {error && (
            <p className="mt-4 text-small font-medium text-red-600">{error}</p>
          )}
        </div>
      </div>

      <div className="rounded-card border border-gray-200 bg-white p-6 shadow-card">
        <h3 className="text-h3 font-bold text-textMain">How it works</h3>
        <div className="mt-5 space-y-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-start gap-3">
              <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#ff6f61] text-small font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-body text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUploadCard;
