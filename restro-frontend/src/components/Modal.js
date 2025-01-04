// Modal.js
import React from 'react';
import './Modal.css'; // Importing the modal's CSS

const Modal = ({ children, onClose, size = 'medium' }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${size}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
