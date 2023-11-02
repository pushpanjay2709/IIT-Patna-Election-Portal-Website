import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Position from './components/Position';
import SubmitButton from './components/SubmitButton';
import ConfirmationPopup from './components/ConfirmationPopup';
import VoteSubmitted from './components/VoteSubmitted'; // Adjust the path accordingly

import axios from 'axios';

function App() {
  const positions = ['Captain', 'President', 'Secretary','CM','PM'];
  const [currentPosition, setCurrentPosition] = useState(0);
  const [selectedCandidates, setSelectedCandidates] = useState(Array(positions.length).fill(null));
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [isSubmit, setisSubmit] = useState(true);
  const [voteSubmitted, setVoteSubmitted] = useState(false);


  useEffect(() => {
    // Fetch candidates when the component mounts
    const fetchCandidates = async () => {
      try {
        await axios.post("http://localhost:8085/images")
          .then(res => {
            const data = res.data.message;
            // console.log(data); // Log the received data
            setCandidates(data); // Update the state
            // console.log(candidates);
          })
          .catch(err => console.log(err));
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };
  
    fetchCandidates();
  }, []); // Empty dependency array to run only on mount

  
  // const currentCandidates = candidates[currentPosition] || [];

  const handleCandidateSelect = (index) => {
    const newSelectedCandidates = [...selectedCandidates];
    newSelectedCandidates[currentPosition] = index;
    setSelectedCandidates(newSelectedCandidates);
  };

  const handleConfirmationClose = () => {
    setIsConfirmationOpen(false);
  };

  const handleConfirmationSubmit = () => {
    if (selectedCandidates.includes(null)) {
      alert('Please select candidates for all positions before submitting.');
    } else {
      setIsConfirmationOpen(true);
    }
  };

  const isSubmitEnabled = selectedCandidates.every((candidate) => candidate !== null) & isSubmit;

  return (
    <div className="App">
      {voteSubmitted ? (
      <VoteSubmitted />
    ) : (
      <>
      <Navbar
        positions={positions}
        currentPosition={currentPosition}
        setCurrentPosition={setCurrentPosition}
        selectedPositions={selectedCandidates.map((candidate, index) =>
          candidate !== null ? index : -1
        )}
      />
      {candidates.length > 0 ? (
  <Position
    position={positions[currentPosition]}
    candidates={candidates[currentPosition]}
    selectedCandidate={selectedCandidates[currentPosition]}
    setSelectedCandidate={handleCandidateSelect}
  />
) : (
  <div>Loading...</div>
)}


      <SubmitButton onSubmit={handleConfirmationSubmit} isSubmitEnabled={isSubmitEnabled} />
      <ConfirmationPopup
        isOpen={isConfirmationOpen}
        onClose={handleConfirmationClose}
        onConfirm={() => {
          // Send selectedCandidates to the backend MySQL database here
          const dataToSend = positions.map((position, index) => ({
            email: candidates[index][selectedCandidates[index]].name
          }));
          setisSubmit(false);
          setIsConfirmationOpen(false);
          console.log(dataToSend);
          axios.post("http://localhost:8085/vote", dataToSend)
          .then((res) => {
            console.log(res.data.message);
            setVoteSubmitted(true);
            // You can update your UI or do other actions as needed
          })
          .catch((err) => {
            console.error("Error submitting votes:", err);
            // Handle errors appropriately
          });
        }}
      />
      </>
    )}
    </div>
  );
}

export default App;
