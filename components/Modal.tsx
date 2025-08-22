import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 animate-slide-in border-2 border-primary">
        <h2 className="text-2xl font-bold text-center mb-4 text-primary font-serif">{title}</h2>
        <div className="text-center text-text-secondary mb-6 prose prose-invert max-w-none">
          {children}
        </div>
        <button
          onClick={onClose}
          className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Modal;