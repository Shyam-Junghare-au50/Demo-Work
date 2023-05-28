const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/send', (req, res) => {
  res.render('contact');
});

app.post('/send', (req, res) => {
  const { name, email, message } = req.body;

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'techblogs151@gmail.com', // Enter your Gmail email address
      pass: 'Shyam@1991' // Enter your Gmail password
    }
  });

  // Set up email data
  const mailOptions = {
    from: email,
    to: 'shyamjunghare56@gmail.com', // Enter the recipient email address
    subject: 'New Message from Contact Form',
    html: `<p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Message:</strong> ${message}</p>`
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.send('Error occurred while sending the email.');
    } else {
      console.log('Email sent: ' + info.response);
      res.send('Email sent successfully!');
    }
  });
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
