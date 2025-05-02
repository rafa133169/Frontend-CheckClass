import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${bgColor[type]} flex items-center justify-between min-w-[300px]`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-lg font-bold">&times;</button>
    </div>
  );
};

export default Toast;