import './Navbar.css';
// Navbar.js

import React from 'react';

const Navbar = ({ positions, currentPosition, setCurrentPosition, selectedPositions }) => {
  return (
    <div className="navbar">
      <ul>
        {positions.map((position, index) => (
          <li
            key={index}
            className={
              currentPosition === index
                ? 'current'
                : selectedPositions.includes(index)
                ? 'selected'
                : ''
            }
            onClick={() => setCurrentPosition(index)}
          >
            {position}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Navbar;
