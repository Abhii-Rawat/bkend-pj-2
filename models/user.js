const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/localserver"); //connect to database 

const userSchema = mongoose.Schema ({
    username: String,
    email: String,
    name: String,
    age: Number,
    password: String,
    posts: [
        {type: mongoose.Schema.Types.ObjectId, ref: "post"}
    ]
})

const user = mongoose.model('User', userSchema);

module.exports = user;