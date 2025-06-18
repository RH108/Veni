const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true }, // New title field
    content: { type: String, required: true },
    image: { type: String }, // Stores image as base64
    timestamp: { type: Date, default: Date.now }
});


const UserSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    picture: { type: String },
    occupation: { type: String, default: "New User" },
    followers: { type: Array, default: [] }, // Array of user IDs
    following: { type: Array, default: [] },
    posts: { type: [PostSchema], default: [] } // Array of posts
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
