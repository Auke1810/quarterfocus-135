import React from 'react';

interface AlertProps {
  message: string;
  onClose: () => void;
}

export const CustomAlert: React.FC<AlertProps> = ({ message, onClose }) => (
  <div className="fixed top-4 right-4 z-50 flex items-center bg-[#004aad] text-white px-4 py-3 rounded shadow-lg">
    <span>{message}</span>
    <button
      onClick={onClose}
      className="ml-4 text-white hover:text-gray-200 focus:outline-none"
    >
      ×
    </button>
  </div>
);
