const PromoStrip = () => {
  const items = [
    { icon: "🚚", title: "Free Delivery", desc: "on orders above ₹299" },
    { icon: "✅", title: "100% Genuine", desc: "Products Guaranteed" },
    { icon: "🔄", title: "Easy Returns", desc: "within 7 days" },
    { icon: "🛡️", title: "Secure Payments", desc: "100% safe" },
  ];

  return (
    <div className="bg-textMain py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8 sm:gap-14">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3 text-white">
            <span className="text-xl">{item.icon}</span>
            <span className="text-body">
              <strong className="font-semibold">{item.title}</strong> {item.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromoStrip;
