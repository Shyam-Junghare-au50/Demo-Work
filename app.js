const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); 
const nodemailer = require('nodemailer');
const path = require('path');


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
let aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
const secretKey = 'https://jwt.io/#debugger-io?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res){

  Post.find({}, function(err, posts){
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });
});

const adminUsername = 'admin';
const adminPassword = 'password';
app.get('/admin', (req, res) => {
  res.render('admin');
});
app.get('/login', (req, res) => {
  res.render('dashboard');
});

app.get('/dashboard', (req, res) => {
  // Get the token from the cookie
  const token = req.cookies.token;

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      // If the token is invalid, redirect to the login page
      res.redirect('/');
    } else {
      // Render the admin dashboard
      res.render('dashboard', { username: decoded.username });
    }
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the credentials are valid
  if (username === adminUsername && password === adminPassword) {
    // Generate a JWT token
    const token = jwt.sign({ username }, secretKey);

    // Set the token as a cookie
    res.cookie('token', token, { httpOnly: true });

    // Redirect to the admin dashboard
    res.redirect('/compose');
  } else {
    // res.send('Invalid credentials');
    res.redirect('/login');
  }
});

// Route to render the admin dashboard
app.get('/dashboard', (req, res) => {
  // Get the token from the cookie
  const token = req.cookies.token;

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      // If the token is invalid, redirect to the login page
      res.redirect('/');
    } else {
      // Render the admin dashboard
      res.render('dashboard', { username: decoded.username });
    }
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });


  post.save(function(err){
    if (!err){
        res.redirect("/");
    }
  });
});

app.get("/posts/:postId", function(req, res){

const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){
    res.render("post", {
      title: post.title,
      content: post.content
    });
  });

});

app.get("/about", function(req, res){
  res.render("about",{aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.post("/delete/:postId", function(req, res) {
  const postId = req.params.postId;

  Post.deleteOne({ _id: postId }, function(err) {
    if (err) {
      console.error("Failed to delete post:", err);
      res.status(500).send("Failed to delete post");
    } else {
      res.redirect("/delete");
    }
  });
});

app.get("/delete", function(req, res) {
  Post.find({}, function(err, posts) {
    if (err) {
      console.error("Failed to fetch posts:", err);
      res.status(500).send("Failed to fetch posts");
    } else {
      res.render("delete", { posts: posts });
    }
  });
});

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
      pass: 'igkyrvhmqiizazxr' // Enter your Gmail App generated password
    }
  });

  // Set up email data
  const mailOptions = {
    from: email,
    to: 'techblogs151@gmail.com', // Enter the recipient email address
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
      // res.send('Email sent successfully!');
      res.redirect('contact')
    }
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
