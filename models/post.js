const mongoose = require("mongoose");

let postSchema = new mongoose.Schema({
    author: {type: mongoose.Types.ObjectId, ref: "User"},
    text: String,
    comments: [{type: mongoose.Types.ObjectId, ref: "Comment"}],
    date: {type: Date, default: Date.now}
});

let Post = new mongoose.model("Post", postSchema);
module.exports = Post;