
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const currentDate = new Date();
const path =require('path');
const fs =require('fs');
const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(cors());
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "stud"
})

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to the database');
  }
});
const jwt = require('jsonwebtoken');

// Generate a token with user information


const globalSecretKey = "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";

// Generate a user-specific secret key


const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  post: 587,
  secure: false,
  auth: {
    user: "portalelection@gmail.com",
    pass: "wwzhsritdmiuhhvf"
  }
});


async function markEmailAsVerified(token) {
  try {
    const sql = "UPDATE confirm SET flag=1 where token=?";
    db.query(sql, [token], (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      return;
    });
    // Use a single SQL query to update the candidate table
    const updateResult = await db.query(`
      UPDATE candidate AS c
      INNER JOIN confirm AS cf ON c.candidate_email = cf.candidate_email
      SET c.count = c.count + 1
      WHERE cf.token = ?
    `, [token]);

    if (updateResult.affectedRows === 0) {
      // No rows were updated, token not found or candidate_email not found
      throw new Error('Token not found or candidate email not found');
    }

    // Email marked as verified successfully
    console.log('Email marked as verified for token:', token);
  } catch (error) {
    console.error('Error marking email as verified:', error);
    throw error;
  }
}


//file upload
const storage = multer.memoryStorage();

const upload = multer({ storage })


app.post('/upload/:user', upload.single('image'), async (req, res) => {
  try {
    const Image = req.file.buffer;
    const email = req.params.user;

    // The binary data of the uploaded image
    const sql = "UPDATE candidate SET image=?  WHERE candidate_email=?";

    const result = await new Promise((resolve, reject) => {
      db.query(sql, [Image, email], (err, result) => {
        if (err) {
          console.error('Error executing SQL query:', err);
          reject(err);
        } else {
          console.log('Query Result:', result);
          resolve(result);
        }
      });
    });

    return res.json({ status: "Success" });
  } catch (error) {
    console.error('Error updating candidate image:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Express route to get BLOB data by candidate ID
app.get('/getImage/:user', (req, res) => {
  const email = req.params.user;
  console.log(email);
  const sql = 'SELECT image FROM candidate WHERE candidate_email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error fetching image data:', err);
      return res.status(500).json({ message: 'Error fetching image' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }
    const imageData = results[0].image.toString('base64');
    // console.log(imageData);
    res.json({ message: imageData }); // Send the image data as JSON
  });
});
async function checkVerificationStatus(token) {
    // Query the user's verification status from the database
    try{
    const query = 'SELECT token FROM confirm WHERE token = ? AND flag = 1';
    const data = await new Promise((resolve, reject) => {
      db.query(query, [token], (err, data) => {
        if (err) {
          console.error('Error checking email:', err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    // Check the verification status
    if (data.length > 0) {
      return 1;
    }
    return 0;
  } catch (error) {
    console.error('Error checking verification status:', error);
    throw error;
  }
}
app.get('/confirm', async (req, res) => {

  const token = req.query.token;
  const verificationStatus = await checkVerificationStatus(token);
  console.log(verificationStatus)
  if (verificationStatus) {
    // User is already verified, prevent access or redirect them
    res.status(403).send('Access denied. Email already verified.');
  } else {
    // Allow the user to proceed with verification
    await markEmailAsVerified(token);
    const styledMessage = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Email Confirmation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #f2f2f2;
          }
          .message {
            font-size: 24px;
            color: #007bff;
            margin-top: 100px;
          }
        </style>
      </head>
      <body>
        <div class="message">Email Verified Successfully!</div>
      </body>
    </html>
  `;

    res.send(styledMessage);
  }
});

app.post(`/confirm/:pos`, async (req, res) => {
  const emailsToConfirm = req.body.email; // Assuming req.body.email is an array of email addresses
  const pos = req.params.pos;
  const email = req.body.user;
  const sql = "UPDATE candidate SET position=? where candidate_email=?";
  db.query(sql, [pos, email], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    return;
  });
  try {
    for (let i = 0; i < emailsToConfirm.length; i++) {
      const n_email = emailsToConfirm[i];
      const user = {
        email: n_email,
      };

      const secretKey = `${user.email}:${globalSecretKey}:${currentDate}`;
      const token = jwt.sign(user, secretKey);

      const verificationLink = `http://localhost:8085/confirm?token=${token}`;

      await transporter.sendMail({
        from: "portalelection@gmail.com",
        to: n_email, // Specify the recipient email address here
        subject: "subject",
        text: `Click the following link to verify your email: ${verificationLink}`,
      });

      const insertSql = 'INSERT INTO confirm (email, token,candidate_email,flag) VALUES (?, ?,?,?)';
      db.query(insertSql, [n_email, token, email, 0], (err) => {
        if (err) {
          console.error('Error storing confirmation token:', err);
        } else {
          console.log("Email sent and token stored successfully");
        }
      });
    }
    res.json({ message: "Emails sent and tokens stored successfully" });
  } catch (error) {
    console.log("Error sending emails:", error);
    res.status(500).json({ message: "Error sending emails" });
  }
});


// Route to check email existence
app.post('/check', (req, res) => {
  //   const { email } = req.body;
  const sql = 'SELECT email FROM btech2020 WHERE email = ?';
  db.query(sql, [req.body.email], (err, data) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (data.length > 0) {
      // Email exists in the database
      console.log("email exist")
      return res.json({ exists: true });
    } else {
      // Email does not exist in the database
      console.log("email dont exist")
      return res.json({ exists: false });
    }
  });
});


//user login
app.post(`/login`,(req, res) => {
  //   const { email } = req.body;
  const sql = 'SELECT candidate_email,count,position FROM candidate WHERE candidate_email = ?';
  const email=req.body.email;
  db.query(sql, [email], (err, data) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (data.length > 0) {
      // Email exists in the database
      const count = data[0].count;
      const position = data[0].position;
      if(position===0){
        return res.json({ message: '-1' });
      }
      if(position===1&&count===4||position>1&&count===2){
        return res.json({ message: '1' });
      }
      return res.json({ message: '0' });
    } else {
      // Email does not exist in the database
      const insertSql = 'INSERT INTO candidate (candidate_email, position,count) VALUES (?, ?,?)';
      db.query(insertSql, [email, 0,0], (err) => {
        if (err) {
          console.error('Error storing confirmation token:', err);
        } else {
          console.log("Email insert");
        }
      });
      return res.json({ message: '-1' });
    }
  });
});

//election
app.post('/vote', async (req, res) => {
  const voteData = req.body;

  try {
    for (const candidate of voteData) {
      const email = candidate.email;
      console.log(email);
      // Update the vote_count for the candidate with the given email and position
      const query = "UPDATE final SET count = count + 1 WHERE candidate_email = ? ";

      await db.queryAsync(query, [email]);
      console.log('Vote count updated for');
    }

    // Respond to the client indicating success
    // Respond to the client indicating success with an HTML message
res.json({ message: "Vote Submitted" });

  } catch (error) {
    console.error('Error updating votes:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Add a promisified version of db.query
db.queryAsync = function (sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

app.post(`/images`,(req, res) => {
    const imageDirectories = ['./c_images/1', './c_images/2', './c_images/3','./c_images/4','./c_images/5']; // Specify your image directories here
    let candidates = [];
    
    imageDirectories.forEach((directory) => {
      const dirPath = path.join(__dirname, directory);
      const images = fs.readdirSync(dirPath);
      let newPosition=[];
      images.forEach((image) => {
        const imageName = path.basename(image, path.extname(image)); // Extract the image name without extension
        if (image.match(/\.(jpg|jpeg|png|gif)$/)) {
          const imagePath = path.join(directory, image);
          // const imageBuffer = fs.readFileSync(path.join(__dirname, imagePath)); // Read the image as a buffer
          // const imageUrl = `${directory}/${image}`;
          const imageBuffer = fs.readFileSync(path.join(__dirname, imagePath)); // Read the image as a buffer
          const base64Image = imageBuffer.toString('base64'); // Convert the buffer to base64
        newPosition.push({ name: imageName, image: `data:image/jpeg;base64,${base64Image}` });
        }
      });
      candidates.push(newPosition);
    });
    
    // console.log(candidates);
    return res.json({message:candidates});
});

app.listen(8085, () => {
  console.log('Listening on port 8085');
});

