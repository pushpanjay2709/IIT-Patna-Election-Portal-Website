import React, { useState, useEffect } from 'react';
import './MyForm.css'; // Import the CSS file
import axios from 'axios'; // Import Axios for making HTTP requests

const positions = ['Select a position', 'Position 1', 'Position 2', 'Position 3', 'Position 4', 'Position 5', 'Position 6', 'Position 7'];
var len = 0;
const MyForm = () => {
  const [selectedPosition, setSelectedPosition] = useState('Select a position');
  const [emails, setEmails] = useState(['', '', '', '']);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [results, setResults] = useState([]);
  // Function to make an API call
  const userEmail = localStorage.getItem('userEmail');
  let str='';
  

    const [file, setFile] = useState();
    
    const flag1 = localStorage.getItem('flag');
    const [flag, setFlag] = useState(flag1);
    console.log(flag);
    if (flag === '0') {
      str = "Approval Pending";
      console.log(str)
    }
    if (flag === '1') {
      str = "Approved";
    }
    const [confirmationMessage, setConfirmationMessage] = useState(str);
    // setConfirmationMessage(str);
  // file check
  function handleFile(e) {
    setFile(e.target.files[0])
  }
  //upload file
  const handleUpload = (event) => {
    event.preventDefault();
    const formdata = new FormData();
    formdata.append('image', file);
    axios.post(`http://localhost:8085/upload/${userEmail}`, formdata)
      .then(res => {
        if (res.data.status === "Success") {
          window.alert("Image loaded successfully!");
          console.log("Succeded")
        }
        else {
          console.log(res.data.message);
          // console.log("Failed")
        }
      })
      .catch(err => console.log(err));
  }
  // Replace with the actual candidate ID
  const handleImage = (event) => {
    event.preventDefault();
    console.log(userEmail);
    axios.get(`http://localhost:8085/getImage/${userEmail}`)
      .then(res => {
        if (res.data.message === "Image not found") {
          console.log("Image not found");
        }
        else {
          const imgElement = document.getElementById("candidateImage");
          imgElement.src = `data:image/jpeg;base64,${res.data.message}`;
          imgElement.style.width = "300px"; // Fixed width
          imgElement.style.height = "200px"; // Fixed height
        }
      })
      .catch(err =>
        console.log('Error fetching image:', err));
  }
  // Define the checkEmailExists function
  const checkEmailExists = async (emailToCheck) => {
    if (selectedPosition === 'Select a position') {
      return false;
    }

    try {
      const response = await axios.post('http://localhost:8085/check', { email: emailToCheck });
      const exists = response.data.exists;
      return exists;
    } catch (error) {
      console.error('Network Error:', error);
      return false;
    }
  };

  // Define the sendConfirmationEmail function
  const sendConfirmationEmail = async (emailResults, i) => {
    try {
      const pos = selectedPosition[9];
      await axios.post(`http://localhost:8085/confirm/${pos}`, { email: emailResults, user: userEmail });
      // const confirmationSent = response.data.sent;
      // return confirmationSent;
    } catch (error) {
      console.error('Network Error:', error);
    }
  };

  const handlePositionChange = (event) => {
    setSelectedPosition(event.target.value);
    setEmails(['', '', '', '']);
    setErrorMessage('');
    setResults([]);
  };

  const handleEmailChange = (event, index) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = event.target.value;
    setEmails(updatedEmails);
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isConfirmed = window.confirm("Are you sure you want to submit?");
    if (isConfirmed) {
      if (selectedPosition === 'Select a position') {
        setErrorMessage('Please select a position.');
        return;
      }

      const emailResults = [];
      let confirmationPending = false, emailSent = false;
      let emailExists = true;
      for (let i = 0; i < len; i++) {
        if (!emails[i].endsWith('@iitp.ac.in')) {
          setErrorMessage(`Email ${i + 1} must end with @iitp.ac.in`);
          return;
        }
        const yearRegex = /2001/i; // The 'i' flag makes the regex case-insensitive
        if (!yearRegex.test(emails[i])) {
          setErrorMessage(`Email ${i + 1} must include the year 2001`);
          return;
        }

        emailExists &= await checkEmailExists(emails[i]);
        console.log(emailExists);
        emailResults.push(emails[i]);
      }
      console.log(emailExists);
      if (emailExists) {
        setFlag('0');
        localStorage.setItem('flag','0');
        setConfirmationMessage('Approval Pending');
      try {
        await sendConfirmationEmail(emailResults);
        console.log("system");
      }
      catch (err) {
        console.error(err);
      }
      console.log("here");
    }
    }
  };

  const renderEmailInputs = () => {
    if (selectedPosition === 'Select a position') {
      return;
    }

    const numEmails = selectedPosition === 'Position 1' ? 4 : 2;
    const emailInputs = [];
    len = numEmails;
    for (let i = 0; i < numEmails; i++) {
      emailInputs.push(
        <div key={i}>
          <label htmlFor={`email${i + 1}`}>Email {i + 1}:</label>
          <input
            type="email"
            id={`email${i + 1}`}
            value={emails[i]}
            onChange={(e) => handleEmailChange(e, i)}
            required
            pattern=".+@iitp\.ac\.in"
            title={`Email ${i + 1} must be of 4th year student and end with @iitp.ac.in`}
          />
        </div>
      );
    }

    return emailInputs;
  };
  const headingStyle = {
    textAlign: 'center',
    color: '#007bff',
    fontSize: '34px',
    marginTop: '0px',
  };
  
  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <h1 style={headingStyle} title={`${userEmail}`}>Election Nomination Form</h1>
      <form>
        <div>
          <label htmlFor="position">Select a Position:</label>
          <select id="position" value={selectedPosition} onChange={handlePositionChange}>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {renderEmailInputs()}

        <div className="error-message">{errorMessage}</div>
        <div className="confirmation-message">{confirmationMessage}</div>
        <div class="upload">
          <label for="fileInput" class="file-label">
            <input type="file" onChange={handleFile} />
          </label>
          <button className="file" onClick={handleUpload}>Upload</button>
        </div>
        Click to show your uploaded image
        <button onClick={handleImage}>Image</button>
        <br></br>
        <img id="candidateImage" src="" alt="Candidate Image" />

        <br></br>
        {flag > -1 ? null : <button onClick={handleSubmit}>Submit</button>}
      </form>

      {/* Results display here */}
    </div>
  );
};

export default MyForm;
