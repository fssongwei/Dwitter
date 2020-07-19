const mongoose = require("mongoose");

// schema
const commentSchema = new mongoose.Schema({  
    author:         {type: mongoose.Types.ObjectId, ref: "User"},
    text:           String,
    date: {type: Date, default: Date.now}
});

// model
let Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;