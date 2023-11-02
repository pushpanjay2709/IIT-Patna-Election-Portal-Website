import './ConfirmationPopup.css';
import React from 'react';

const ConfirmationPopup = ({ isOpen, onClose, onConfirm }) => {
  return (
    <div className={`confirmation-popup ${isOpen ? 'open' : ''}`}>
      <div className="popup-content">
        <p>Do you want to submit your vote?</p>
        <button onClick={onConfirm}>Yes</button>
        <button onClick={onClose}>No</button>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
