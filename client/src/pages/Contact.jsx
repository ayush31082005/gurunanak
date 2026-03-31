import PageHero from "../components/common/PageHero";
import Button from "../components/common/Button";

const Contact = () => {
  return (
    <>
      <PageHero
        title="Contact Us"
        description="Simple frontend-ready contact section for your pharmacy ecommerce project."
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

          <form className="bg-white rounded-card border border-gray-200 p-6 shadow-card space-y-4">
            <input className="w-full rounded-card border border-gray-200 px-4 py-3 outline-none" placeholder="Your Name" />
            <input className="w-full rounded-card border border-gray-200 px-4 py-3 outline-none" placeholder="Email Address" />
            <textarea className="w-full min-h-32 rounded-card border border-gray-200 px-4 py-3 outline-none" placeholder="Your Message" />
            <Button>Send Message</Button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Contact;
