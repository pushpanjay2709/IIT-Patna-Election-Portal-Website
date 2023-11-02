import './SubmitButton.css';
// SubmitButton.js

import React from 'react';

const SubmitButton = ({ onSubmit, isSubmitEnabled }) => {
  return (
    <div className="submit-button">
      <button onClick={onSubmit} disabled={!isSubmitEnabled}>
        SUBMIT
      </button>
    </div>
  );
};

export default SubmitButton;
