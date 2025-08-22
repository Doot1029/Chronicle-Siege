import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content size-sm">
        <h2 className="font-serif" style={{textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-primary)'}}>{title}</h2>
        <div style={{textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: '1.5rem'}} className="prose prose-invert">
          {children}
        </div>
        <button
          onClick={onClose}
          className="btn btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Modal;