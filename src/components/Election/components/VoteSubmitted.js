import React from 'react';
import './VoteSubmitted.css'; // Import the CSS file

const VoteSubmitted = () => {
  return (
    <div className="vote-submitted-container">
      <div className="vote-submitted-content">
        <h2>Your Vote Has Been Submitted Successfully</h2>
        <p>Thank you for participating in the election!</p>
        {/* Add any additional content or links here */}
      </div>
    </div>
  );
};

export default VoteSubmitted;
