// src/components/Button.jsx
import React from 'react';

const Button = ({ children, onClick, variant = 'primary' }) => {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default Button;