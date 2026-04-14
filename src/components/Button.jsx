function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 shadow-lg";
  const styles = {
    primary: "bg-white text-slate-900 hover:bg-pink-50 hover:scale-105 hover:shadow-xl active:scale-95",
    secondary: "border-2 border-white/50 text-white hover:border-white hover:bg-white/10 hover:scale-105 active:scale-95",
    ghost: "text-white hover:text-pink-200 hover:bg-white/5",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
