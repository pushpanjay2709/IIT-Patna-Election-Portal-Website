import React from 'react';
import './Position.css';
import Candidate from './Candidate';

const Position = ({ position, candidates, selectedCandidate, setSelectedCandidate }) => {
  return (
    <div className="position">
      <h2>{position}</h2>
      {candidates.map((candidate, index) => (
        <Candidate
          key={index}
          candidate={candidate}
          isSelected={selectedCandidate === index}
          onSelect={() => setSelectedCandidate(index)}
        />
      ))}
    </div>
  );
};

export default Position;
