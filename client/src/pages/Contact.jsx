import { useState } from "react";
import PageHero from "../components/common/PageHero";
import Button from "../components/common/Button";
import API from "../api";

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
      <section className="py-10 bg-bg">
        <div className="container-padded grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-card border border-gray-200 p-6 shadow-card">
            <h2 className="text-h2 font-bold">Support Information</h2>
            <div className="mt-5 space-y-3 text-body text-gray-700">
              <p>📞 Phone: 1800-212-2323</p>
              <p>✉️ Email: support@gurunanak.com</p>
              <p>📍 Address: New Delhi, India</p>
              <p>🕒 Support Hours: 8:00 AM to 10:00 PM</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-card border border-gray-200 p-6 shadow-card space-y-4"
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
              className="w-full min-h-32 rounded-card border border-gray-200 px-4 py-3 outline-none"
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
