const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "stud"
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to the database');
  }
});

const cImagesFolder = './c_images'; // Path to the main folder

// Create the main folder if it doesn't exist
if (!fs.existsSync(cImagesFolder)) {
  fs.mkdirSync(cImagesFolder);
}

const query = 'SELECT candidate_email, position, image FROM candidate';
db.query(query, (err, results) => {
  if (err) {
    console.error('Error executing SQL query:', err);
    throw err;
  }

  // Process the query results
  results.forEach((row) => {
    const { candidate_email, position, image } = row;

    // Check if candidate_email and position are defined and not empty
    if (candidate_email && position) {
      // Create a folder for the position if it doesn't exist
      const positionFolder = `./c_images/${position}`;
      if (!fs.existsSync(positionFolder)) {
        fs.mkdirSync(positionFolder);
      }
      // Write the image data to a file using the candidate's email as the filename
      fs.writeFileSync(`${positionFolder}/${candidate_email}.jpg`, image, 'binary');
    }
  });

  console.log('Candidate images organized into subfolders.');
});
