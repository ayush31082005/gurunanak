const Footer = () => {
  const cols = [
    {
      title: "Quick Links",
      links: ["Medicines", "Pathology Tests", "Health Articles", "Doctor Consultation", "Upload Prescription"],
    },
    {
      title: "Categories",
      links: ["Vitamins", "Skin Care", "Hair Care", "Diabetes", "Heart Health"],
    },
    {
      title: "Support",
      links: ["Contact Us", "FAQs", "Shipping Policy", "Returns", "Privacy Policy"],
    },
  ];

  return (
    <footer className="bg-darkFoot text-gray-400">
      <div className="container-padded pt-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-heading font-extrabold text-xl text-white">GURUNANAK</span>
              {/* <span className="bg-brand text-white text-[11px] font-bold px-2 py-0.5 rounded-md">Rx</span> */}
            </div>
            <p className="text-body leading-relaxed max-w-xs">
              Your trusted online pharmacy. Genuine medicines and health products across India  delivered with care.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-heading font-bold text-white text-body-lg mb-4">{col.title}</h4>
              {col.links.map((link) => (
                <a key={link} href="#" className="block text-body text-gray-400 mb-2.5 hover:text-brand transition-colors">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-small">
          <span>© 2026 Gurunanak. All rights reserved.</span>
          <span>Made with ❤️ in India</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
