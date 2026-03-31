const Badge = ({ children, variant = "green" }) => {
  const variants = {
    green: "bg-green-100 text-secondary",
    red: "bg-red-100 text-brand",
    blue: "bg-blue-100 text-primary",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <span className={`text-small font-semibold px-2 py-0.5 rounded-pill ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;
