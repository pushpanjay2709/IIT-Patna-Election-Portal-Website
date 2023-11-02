// Candidate.js

import './Candidate.css';
import React from 'react';

// Import candidate images


const Candidate = ({ candidate, isSelected, onSelect }) => {
  // Use the imported image variables


  return (
    <div
      className={`candidate ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <img src={candidate.image} alt={candidate.name} />
      <p>{candidate.name}</p>
    </div>
  );
};

export default Candidate;
