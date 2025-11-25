import React from 'react';

const Logo = ({ className = "", variant = "default" }) => {
  const sizes = {
    small: { container: "h-10", text: "text-base" },
    default: { container: "h-12", text: "text-xl" },
    large: { container: "h-16", text: "text-2xl" }
  };

  const size = sizes[variant] || sizes.default;

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${size.container} aspect-square bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg`}>
        <span className="text-white font-bold text-xl tracking-tight">GT</span>
      </div>
      <div className="ml-3">
        <div className={`${size.text} font-bold text-gray-900 leading-tight`}>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">Golden Touch</span>
        </div>
        <div className="text-xs text-gray-600 font-medium">Cleaning Services</div>
      </div>
    </div>
  );
};

export default Logo;
