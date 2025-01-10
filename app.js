const express = require('express');
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({extended: true}));
// app.use(express.static(path.join(__dirname,"public")));

const port = 3000; // Set the port to 3000

app.get('/', async (req, res) => {
    try {
        res.status(200).render('index');
    } catch (error) {
        console.error('Error rendering index:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/register', async (req, res) => {
    try {
        let {email, password, username, age, name} = req.body;
        
        let user = await userModel.findOne({email});
        if (user) {
            return res.status(400).send('Email already registered');
        }
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) =>{
                let user = await userModel.create({
                    username,
                    email,
                    age,
                    name,
                    password: hash
                })
                let token = jwt.sign({email: email, userid: user._id}, "shhh");
                res.cookie("token", token);
                res.statusMessage("registered");
                res.redirect('/login');
            })
        })
    } catch (error) {
        console.error('Error rendering index:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/login', function isLoggedIn(req, res){
    try {
        res.status(200).render('login');
    } catch (error) {
        console.error('Error rendering index:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', async (req, res) => {
    try {
        let {email, password} = req.body;
        
        let user = await userModel.findOne({email});
        if (!user) {
            return res.status(500).send('Something went worng');
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                res.status(200).send('Login successful');
            } else {
                res.redirect('/login');
            }
        })
    } catch (error) {
        console.error('Error rendering index:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', async (req, res) => {
    try {
        res.clearCookie("token");
        res.redirect('/login');
    } catch (error) {
        console.error('Error rendering index:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/profile', isLoggedIn, (req, res) => {
    if (!req.user) {
      return res.send("You must be logged in");
    }
    res.send("heloo ji");
  })

async function isLoggedIn(req, res, next) {
    if (!req.cookies.token){
        return res.send("You must be logged in");
    }else{
        let data = await jwt.verify(req.cookies.token, "shhh");
        req.user = data;
    }
    next();
}



app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`);
});

