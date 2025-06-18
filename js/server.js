const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const User = require("../models/User.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));  
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors({ origin: "http://127.0.0.1:5500" }));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.post("/auth/google", async (req, res) => {
    try {
        const { googleId, name, email, picture } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ googleId, name, email, picture });
            await user.save();
        }

        res.status(200).json({ message: "User authenticated", user });
    } catch (error) {
        console.error("❌ Authentication Error:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
});

app.post("/getUser", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ user });
    } catch (error) {
        console.error("❌ Error fetching user data:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: "Query parameter is missing" });

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { occupation: { $regex: query, $options: "i" } }
            ]
        }).limit(5);

        res.json(users.length ? users : []);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/follow", async (req, res) => {
    const { userEmail, targetEmail } = req.query;
    if (!userEmail || !targetEmail) return res.status(400).json({ success: false, message: "Missing userEmail or targetEmail" });

    try {
        const user = await User.findOne({ email: userEmail });
        const targetUser = await User.findOne({ email: targetEmail });

        if (!user || !targetUser) return res.status(404).json({ success: false, message: "User not found" });

        let isFollowing = user.following.includes(targetEmail);

        if (isFollowing) {
            user.following = user.following.filter(email => email !== targetEmail);
            targetUser.followers = targetUser.followers.filter(email => email !== userEmail);
        } else {
            user.following.push(targetEmail);
            targetUser.followers.push(userEmail);
        }

        await user.save();
        await targetUser.save();

        res.json({ success: true, isFollowing: !isFollowing, updatedFollowing: user.following, updatedFollowers: targetUser.followers });
    } catch (error) {
        console.error("❌ Mongoose Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get("/check-follow", async (req, res) => {
    const { userEmail, targetEmail } = req.query;
    if (!userEmail || !targetEmail) return res.status(400).json({ success: false, message: "Missing userEmail or targetEmail" });

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, isFollowing: user.following.includes(targetEmail) });
    } catch (error) {
        console.error("❌ Mongoose Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get("/get-followers", async (req, res) => {
    const { targetEmail } = req.query;
    if (!targetEmail) return res.status(400).json({ success: false, message: "Missing targetEmail" });

    try {
        const user = await User.findOne({ email: targetEmail });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.json({ success: true, followerCount: user.followers.length });
    } catch (error) {
        console.error("❌ Error fetching follower count:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/posts/:email", async (req, res) => {
    try {
        const { title, content, image } = req.body;
        const { email } = req.params;

        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const newPost = { title, content, image, timestamp: new Date() };
        user.posts.push(newPost);
        await user.save();

        res.status(201).json({ message: "Post added successfully", posts: user.posts });
    } catch (error) {
        console.error("❌ Error adding post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/api/posts/:email", async (req, res) => {
    try {
        const { email } = req.params;
        
        // Find user by email instead of ID
        const user = await User.findOne({ email }).select("posts");

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json({ posts: user.posts });
    } catch (error) {
        console.error("❌ Error fetching posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
