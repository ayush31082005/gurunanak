import { useEffect, useRef, useState } from "react";
import Button from "../common/Button";
import API from "../../api";
import { Sparkles, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { scanReminderImage } from "../../api/reminderApi";
import { useToast } from "../../context/ToastContext";

const steps = [
  "Upload clear prescription image",
  "Our pharmacist verifies medicine details",
  "You receive a call for order confirmation",
  "Medicines are packed and delivered safely",
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const isValidEmail = (email) => /^[^\s@]+@gmail\.com$/i.test(email);

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
  const { success: showSuccessToast } = useToast();
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
  const [scanLoading, setScanLoading] = useState(false);
  const [rawScanText, setRawScanText] = useState("");
  const [showRawText, setShowRawText] = useState(false);

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
  
  const handleScan = async () => {
    if (!selectedFile) {
      setError("Please choose a prescription image first.");
      return;
    }

    if (selectedFile.type === "application/pdf") {
      setError("OCR scan is only available for JPG and PNG images.");
      return;
    }

    try {
      setScanLoading(true);
      setError("");
      
      const { data } = await scanReminderImage(selectedFile);
      
      if (data?.rawScanText) {
        setRawScanText(data.rawScanText);
        setShowRawText(true);
      } else {
        setError("Could not extract any text from this image.");
      }
    } catch (err) {
      console.error("Scan error:", err);
      setError(err?.response?.data?.message || "Failed to scan prescription image.");
    } finally {
      setScanLoading(false);
    }
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
      scrollFormToTop();
      return;
    }

    if (!isValidEmail(form.email.trim())) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Please enter a valid Gmail address.",
      }));
      setError("Please enter a valid Gmail address.");
      scrollFormToTop();
      return;
    }

    if (form.mobile.trim().length !== 10) {
      setFieldErrors((prev) => ({
        ...prev,
        mobile: "Please enter a valid 10-digit mobile number.",
      }));
      setError("Please enter a valid 10-digit mobile number.");
      scrollFormToTop();
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setFieldErrors({
        name: "",
        email: "",
        mobile: "",
        address: "",
        file: "",
      });

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("email", form.email.trim());
      formData.append("mobile", form.mobile.trim());
      formData.append("address", form.address.trim());
      formData.append("file", selectedFile);

      await API.post("/prescriptions", formData);

      showSuccessToast("Prescription submitted successfully. Our team will contact you shortly.", {
        title: "Prescription Submitted",
      });
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
      scrollFormToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
                className="shrink-0 !bg-[#0EA5E9] px-3 py-1.5 text-[11px] hover:!bg-[#0EA5E9]"
                onClick={handleChooseFile}
              >
                Choose File
              </Button>
            </div>
            <p className="mt-1 text-xs text-slate-500">JPG, PNG or PDF up to 5MB</p>

            {selectedFile && selectedFile.type !== "application/pdf" && (
              <button
                type="button"
                onClick={handleScan}
                disabled={scanLoading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 py-2.5 text-xs font-bold text-sky-600 transition hover:bg-sky-100 disabled:opacity-50"
              >
                {scanLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {scanLoading ? "Scanning prescription..." : "Auto Scan Prescription (OCR)"}
              </button>
            )}

            {fieldErrors.file ? (
              <p className="mt-1 text-xs font-medium text-red-600">
                {fieldErrors.file}
              </p>
            ) : null}
            {error && !fieldErrors.file ? (
              <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
            ) : null}
          </div>

          {(showRawText || rawScanText) && (
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="mb-1.5 block text-small font-semibold text-textMain">
                  Scanned Text (OCR Result)
                </label>
                <button
                  type="button"
                  onClick={() => setShowRawText(!showRawText)}
                  className="text-xs font-bold text-sky-600 hover:underline"
                >
                  {showRawText ? "Hide result" : "Show result"}
                </button>
              </div>
              {showRawText && (
                <div className="relative">
                  <textarea
                    value={rawScanText}
                    readOnly
                    placeholder="OCR results will appear here..."
                    rows={4}
                    className="w-full rounded-card border border-sky-100 bg-sky-50/30 px-4 py-3 text-xs leading-6 text-slate-600 outline-none transition focus:border-sky-300"
                  />
                  <div className="absolute right-3 top-3 text-sky-400">
                    <FileText size={16} />
                  </div>
                </div>
              )}
            </div>
          )}

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
            className="!bg-[#0EA5E9] hover:!bg-[#0EA5E9]"
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
                  <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#0EA5E9] text-small font-semibold text-white">
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
