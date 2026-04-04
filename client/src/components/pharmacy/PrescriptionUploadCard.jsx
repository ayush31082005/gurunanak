import { useEffect, useRef, useState } from "react";
import Button from "../common/Button";
import API from "../../api";

const steps = [
  "Upload clear prescription image",
  "Our pharmacist verifies medicine details",
  "You receive a call for order confirmation",
  "Medicines are packed and delivered safely",
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const isValidEmail = (email) => /^[^\s@]+@gmail\.com$/i.test(email);

const convertFileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("Failed to read the selected file."));

    reader.readAsDataURL(file);
  });

const validateFieldValue = (name, value) => {
  const trimmedValue = value.trim();

  if (name === "email") {
    if (!trimmedValue) {
      return "Please enter email address.";
    }

    if (!isValidEmail(trimmedValue)) {
      return "Please enter a valid Gmail address.";
    }
  }

  if (name === "mobile") {
    if (!trimmedValue) {
      return "Please enter mobile number.";
    }

    if (trimmedValue.length !== 10) {
      return "Please enter a valid 10-digit mobile number.";
    }
  }

  return "";
};

const PrescriptionUploadCard = () => {
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    file: "",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      setForm((prev) => ({
        ...prev,
        name: prev.name || storedUser?.name || "",
        email: prev.email || storedUser?.email || "",
      }));
    } catch {
      // Ignore invalid localStorage data.
    }
  }, []);

  const scrollFormToTop = () => {
    cardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    const nextValue =
      name === "mobile" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setFieldErrors((prev) => {
      const nextError = prev[name]
        ? validateFieldValue(name, nextValue)
        : "";

      return {
        ...prev,
        [name]: nextError,
      };
    });
    setError("");

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;

    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateFieldValue(name, value),
    }));
  };

  const validateAndStoreFile = (file) => {
    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setSelectedFile(null);
      setFieldErrors((prev) => ({
        ...prev,
        file: "Please choose a JPG, PNG or PDF file.",
      }));
      setError("Please choose a JPG, PNG or PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setFieldErrors((prev) => ({
        ...prev,
        file: "File size must be 5MB or less.",
      }));
      setError("File size must be 5MB or less.");
      return;
    }

    setSelectedFile(file);
    setFieldErrors((prev) => ({
      ...prev,
      file: "",
    }));
    setError("");
    setSuccessMessage("");
    setShowSuccessPopup(false);
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

  const handleSubmit = async () => {
    const nextFieldErrors = {
      name: form.name.trim() ? "" : "Please enter full name.",
      email: form.email.trim() ? "" : "Please enter email address.",
      mobile: form.mobile.trim() ? "" : "Please enter mobile number.",
      address: form.address.trim() ? "" : "Please enter full delivery address.",
      file: selectedFile ? "" : "Please choose prescription file.",
    };

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setFieldErrors(nextFieldErrors);
      setError("");
      setSuccessMessage("");
      setShowSuccessPopup(false);
      scrollFormToTop();
      return;
    }

    if (!isValidEmail(form.email.trim())) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Please enter a valid Gmail address.",
      }));
      setError("Please enter a valid Gmail address.");
      setSuccessMessage("");
      setShowSuccessPopup(false);
      scrollFormToTop();
      return;
    }

    if (form.mobile.trim().length !== 10) {
      setFieldErrors((prev) => ({
        ...prev,
        mobile: "Please enter a valid 10-digit mobile number.",
      }));
      setError("Please enter a valid 10-digit mobile number.");
      setSuccessMessage("");
      setShowSuccessPopup(false);
      scrollFormToTop();
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");
      setShowSuccessPopup(false);
      setFieldErrors({
        name: "",
        email: "",
        mobile: "",
        address: "",
        file: "",
      });

      const fileData = await convertFileToDataUrl(selectedFile);

      await API.post("/prescriptions", {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        fileData,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
      });

      setSuccessMessage("Prescription submitted successfully.");
      setShowSuccessPopup(true);
      setForm({
        name: "",
        email: "",
        mobile: "",
        address: "",
      });
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (submissionError) {
      console.error(submissionError);
      setError(
        submissionError.response?.data?.message ||
          submissionError.message ||
          "Something went wrong while submitting the prescription."
      );
      setSuccessMessage("");
      setShowSuccessPopup(false);
      scrollFormToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {showSuccessPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.22)] sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
              ✓
            </div>
            <h3 className="mt-5 text-2xl font-bold text-slate-900">
              Prescription Submitted
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Your prescription has been submitted successfully. Our team will
              review it and contact you shortly.
            </p>
            <Button
              className="mt-6 bg-[#ff6f61] hover:bg-[#f45d4f]"
              onClick={() => setShowSuccessPopup(false)}
              type="button"
            >
              OK
            </Button>
          </div>
        </div>
      ) : null}

      <div className="grid items-start gap-4 lg:grid-cols-[1.18fr_0.82fr]">
        <div
          ref={cardRef}
          className="rounded-card border border-gray-200 bg-white p-5 shadow-card"
        >
        <h2 className="text-h2 font-bold text-textMain">Upload prescription</h2>
        <p className="mt-1 text-body text-gray-600">
          Share your prescription and our team will review it before confirming
          your medicine order.
        </p>

        <div className="mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-small font-semibold text-textMain">
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
            {fieldErrors.name ? (
              <p className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-small font-semibold text-textMain">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              className="w-full rounded-card border border-gray-200 px-4 py-3 outline-none transition focus:border-primary"
            />
            {fieldErrors.email ? (
              <p className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-small font-semibold text-textMain">
              Mobile number
            </label>
            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter mobile number"
              inputMode="numeric"
              maxLength={10}
              className="w-full rounded-card border border-gray-200 px-4 py-3 outline-none transition focus:border-primary"
            />
            {fieldErrors.mobile ? (
              <p className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.mobile}
              </p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-small font-semibold text-textMain">
              Prescription file
            </label>
            <div
              className={`flex min-h-[46px] items-center justify-between gap-2 rounded-card border px-3 py-2 transition-colors ${
                isDragActive
                  ? "border-primary bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
              onClick={handleChooseFile}
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

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-500">
                  {selectedFile ? selectedFile.name : "Choose prescription file"}
                </p>
              </div>

              <Button
                className="shrink-0 !bg-[#ff6f61] px-3 py-1.5 text-[11px] hover:!bg-[#ff6f61]"
                onClick={handleChooseFile}
              >
                Choose File
              </Button>
            </div>
            <p className="mt-1 text-xs text-slate-500">JPG, PNG or PDF up to 5MB</p>
            {fieldErrors.file ? (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.file}
              </p>
            ) : null}
            {error && !fieldErrors.file ? (
              <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
            ) : null}
            {successMessage ? (
              <p className="mt-1 text-xs font-medium text-green-700">
                {successMessage}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-small font-semibold text-textMain">
              Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter full delivery address"
              rows={2}
              className="w-full rounded-card border border-gray-200 px-4 py-3 outline-none transition focus:border-primary"
            />
            {fieldErrors.address ? (
              <p className="mt-2 text-xs font-medium text-red-600">
                {fieldErrors.address}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex justify-center">
          <Button
            className="!bg-[#ff6f61] hover:!bg-[#ff6f61]"
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? "Submitting..." : "Submit Prescription"}
          </Button>
        </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-card border border-gray-200 bg-white p-5 shadow-card">
            <h3 className="text-h3 font-bold text-textMain">How it works</h3>
            <div className="mt-4 space-y-2.5">
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

          <div className="overflow-hidden rounded-card border border-gray-200 bg-white shadow-card">
            <div className="bg-gradient-to-r from-[#fff4f2] to-[#f3f8ff] px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">
                Safe Prescription Assistance
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Share a clear prescription and our team will help you quickly.
              </p>
            </div>
            <div className="p-3">
              <img
                src="/Heart Care.webp"
                alt="Prescription assistance"
                className="h-44 w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrescriptionUploadCard;
