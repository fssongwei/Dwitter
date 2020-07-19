const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    following: [{type: mongoose.Types.ObjectId, ref: "User"}],
    favorites: [{type: mongoose.Types.ObjectId, ref: "Post"}]
});

let User = new mongoose.model("User", userSchema);
module.exports = User;