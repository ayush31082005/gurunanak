import { useState } from "react";
import {
  Clock3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import PageHero from "../components/common/PageHero";
import Button from "../components/common/Button";
import API from "../api";
import {
  SOCIAL_LINKS,
  SUPPORT_ADDRESS,
  SUPPORT_EMAIL,
  SUPPORT_HOURS,
  SUPPORT_PHONE,
} from "../utils/constants";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback({ type: "", text: "" });

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFeedback({
        type: "error",
        text: "Please fill your name, email, and message.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await API.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });

      setFeedback({
        type: "success",
        text: response.data.message || "Message sent successfully.",
      });
      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error.response?.data?.message || "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        title="Contact Us"
        description="Reach out to our pharmacy team for support, order help, or general questions."
      />
      <section className="bg-bg py-10">
        <div className="container-padded grid gap-6 lg:grid-cols-2">
          <div className="rounded-card border border-gray-200 bg-white p-6 shadow-card">
            <h2 className="text-h2 font-bold">Support Information</h2>
            <div className="mt-5 space-y-3 text-body text-gray-700">
              <a
                href={`tel:${SUPPORT_PHONE.replace(/\D/g, "")}`}
                className="flex items-center gap-3 transition-colors hover:text-brand"
              >
                <Phone size={18} className="text-brand" />
                <span>Phone: {SUPPORT_PHONE}</span>
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-3 transition-colors hover:text-brand"
              >
                <Mail size={18} className="text-brand" />
                <span>Email: {SUPPORT_EMAIL}</span>
              </a>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-brand" />
                <span>Address: {SUPPORT_ADDRESS}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock3 size={18} className="text-brand" />
                <span>Support Hours: {SUPPORT_HOURS}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((item) => {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-slate-700 transition hover:border-brand hover:bg-brand hover:text-white"
                    title={item.label}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="h-5 w-5 object-contain"
                    />
                  </a>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-card border border-gray-200 bg-white p-6 shadow-card space-y-4"
          >
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-card border border-gray-200 px-4 py-3 outline-none"
              placeholder="Your Name"
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-card border border-gray-200 px-4 py-3 outline-none"
              placeholder="Email Address"
            />
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="min-h-32 w-full rounded-card border border-gray-200 px-4 py-3 outline-none"
              placeholder="Your Message"
            />
            {feedback.text ? (
              <p
                className={`text-sm ${
                  feedback.type === "success" ? "text-green-700" : "text-red-600"
                }`}
              >
                {feedback.text}
              </p>
            ) : null}
            <Button type="submit">
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Contact;
