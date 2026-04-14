function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-lg shadow-lg bg-gray-800 text-white p-6 ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
      {children}
    </div>
  );
}

export default Card;
