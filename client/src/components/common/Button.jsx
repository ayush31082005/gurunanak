const Button = ({ children, variant = "primary", size = "md", onClick, className = "", type = "button" }) => {
  const base = "font-heading font-semibold rounded-pill transition-all duration-200 inline-flex items-center justify-center gap-2 cursor-pointer";

  const variants = {
    primary: "bg-primary text-white hover:bg-[#0284C7] shadow-card hover:shadow-hover",
    secondary: "bg-secondary text-white hover:bg-green-600",
    outline: "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white",
    brand: "bg-brand text-white hover:bg-red-700",
    ghost: "bg-transparent text-primary border border-primary hover:bg-blue-50",
  };

  const sizes = {
    sm: "text-small px-3 py-1.5",
    md: "text-body px-5 py-2.5",
    lg: "text-body-lg px-7 py-3",
  };

  return (
    <button type={type} onClick={onClick} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
