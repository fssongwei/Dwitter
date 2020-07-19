if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    User = require("./models/user"),
    Post = require("./models/post"),
    Comment = require("./models/comment"),
    bcrypt = require("bcrypt"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    passportInit = require("./passport-config"),
    flash = require("express-flash"),
    session = require("express-session"),
    methodOverride = require("method-override"),
    seedDB = require("./seeds");

// Seed Database (comment out if in production enviroment)
if (process.env.NODE_ENV !== "production") {
    const seedDB =  require("./seeds")
    seedDB();
}

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.path = req.path;
    res.locals.profileUser = null;
    next();
});
app.set("view engine", "ejs");


// Database
mongoose.connect('mongodb://localhost/Dwitter', { useNewUrlParser: true, useUnifiedTopology: true });

passportInit(passport);

// ROUTER

// Register & login
app.get("/", (req, res) => {
    res.redirect("login");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    let user = req.body.user;
    try {
        user.password = await bcrypt.hash(user.password, 10);

        let foundUser = await User.findOne({ email: user.email });
        if (foundUser) {
            console.log("user exists!");
            res.redirect("/register");
        } else {
            User.create(user);
            res.redirect("/login");
        }
    } catch (err) {
        console.log(err);
        res.redirect("/register");
    }
});

app.post("/login",
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true
    }), async (req, res) => {
        req.flash("success", "Welcome Back, " + req.user.name);
        res.redirect("/posts");
    });

app.delete("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
})


// posts

app.get("/posts", checkAuthenticated, async (req, res) => {
    try {
        let posts = await Post.find({}).populate("author").populate({ path: "comments", populate: { path: "author" } }).exec();
        for (post of posts) {
            post.hasFollowed = req.user.following.includes(post.author.id);
            post.isFavorite = req.user.favorites.includes(post.id);
        }
        res.render("posts/posts", { posts: posts});
    } catch (err) {
        console.log(err);
    }
});

app.get("/posts/following", checkAuthenticated, async (req, res) => {
    try {
        let posts = [];
        for (user of req.user.following) {
            let postsOftheUser = await Post.find({ author: user }).populate("author").populate({ path: "comments", populate: { path: "author" } }).exec();
            for (post of postsOftheUser) {
                post.hasFollowed = true;
                post.isFavorite = req.user.favorites.includes(post.id);
            }
            posts = posts.concat(postsOftheUser);
        }
        user = await User.findById(req.user.id).populate("following").exec();
        res.render("posts/posts", {posts: posts, user : user});
    } catch (err) {
        console.log(err);
    }
});

app.get("/posts/favorite", checkAuthenticated, async (req, res) => {
    try {
        let posts = [];
        for (post of req.user.favorites) {
            foundPost = await Post.findById(post).populate("author").populate({ path: "comments", populate: { path: "author" } }).exec();
            foundPost.hasFollowed = req.user.following.includes(foundPost.author.id);
            foundPost.isFavorite = true;
            posts.push(foundPost);
        }
        res.render("posts/posts", {posts: posts});
    } catch (err) {
        console.log(err);
    }
});


app.get("/posts/new", checkAuthenticated, (req, res) => {
    res.render("posts/new");
});

app.post("/posts", checkAuthenticated, async (req, res) => {
    try {
        await Post.create({
            author: req.user,
            text: req.body.text
        });
        req.flash("success", "Post Created");
        res.redirect("posts");
    } catch (error) {
        req.flash("error", "Someting Went Wrong: " + error);
        res.redirect("/posts");
        console.log(error);
    }
});

// app.get("/posts/:id", checkAuthenticated, async (req, res) => {
//     try {
//         let post = await Post.findById(req.params.id).populate("author").populate({ path: "comments", populate: { path: "author" } }).exec();
//         res.render("posts/post", { post: post });
//     } catch (error) {
//         console.log(error);
//     }
// });

app.delete("/posts/:id", checkAuthenticated, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id).populate("author").exec();
        if (post.author.id === req.user.id) {
            await Post.findByIdAndRemove(req.params.id);
        }
        req.flash("success", "Post Deleted");
        res.redirect("/posts");
    } catch (error) {
        req.flash("error", "Someting Went Wrong: " + error);
        res.redirect("/posts");
        console.log(error);
    }
});

    // Favorites

app.post("/posts/favorite/:id", checkAuthenticated, async (req, res) => {
    try {
        let foundUser = await User.findById(req.user.id);
        foundUser.favorites.push(req.params.id);
        await foundUser.save();
        res.redirect(req.body.redirectPath);
    } catch (err) {
        req.flash("error", "Someting Went Wrong: " + err);
        res.redirect(req.body.redirectPath);        
        console.log(err);
    }
});

app.delete("/posts/favorite/:id", checkAuthenticated, async (req, res) => {
    try {
        let foundUser = await User.findById(req.user.id);
        foundUser.favorites.pull(req.params.id);
        await foundUser.save();
        res.redirect(req.body.redirectPath);
    } catch (err) {
        req.flash("error", "Someting Went Wrong: " + err);
        res.redirect(req.body.redirectPath);   
        console.log(err);
    }
});


// comment
app.post("/comments/:id", checkAuthenticated, async (req, res) => {
    try {
        let comment = await Comment.create({
            author: req.user,
            text: req.body.text
        });
        let post = await Post.findById(req.params.id);
        post.comments.push(comment);
        await post.save();
        req.flash("success", "Comment Posted");
        res.redirect(req.body.redirectPath);
    } catch (error) {
        req.flash("error", "Someting Went Wrong: " + error);
        res.redirect(req.body.redirectPath);   
        console.error();
    }
})

app.delete("/comments/:id", checkAuthenticated, async (req, res) => {
    try {
        let comment = await Comment.findById(req.params.id).populate("author").exec();
        if (comment.author.id === req.user.id) {
            await Comment.findByIdAndRemove(req.params.id);
        }
        req.flash("success", "Comment Deleted");
        res.redirect(req.body.redirectPath);
    } catch (error) {
        req.flash("error", "Someting Went Wrong: " + error);
        res.redirect(req.body.redirectPath);
        console.error();
    }
});

// Profile

app.get("/profiles/:id", checkAuthenticated, async (req, res) => {
    try {
        let profileUser = await User.findById(req.params.id).populate("following").exec();
        let hasFollowed = req.user.following.includes(profileUser.id);
        let posts = await Post.find({ author: profileUser }).populate("author").populate({ path: "comments", populate: { path: "author" } }).exec();
        for (post of posts) {
            post.hasFollowed = hasFollowed;
            post.isFavorite = req.user.favorites.includes(post.id);
        }
        res.render("posts/posts", { profileUser: profileUser, hasFollowed: hasFollowed, posts: posts});
    } catch (err) {
        console.log(err);
    }
});

// follow
app.post("/profiles/:id", checkAuthenticated, async (req, res) => {
    try {
        let followingUser = await User.findById(req.params.id);
        let followerUser = await User.findById(req.user.id);
        followerUser.following.push(followingUser);
        await followerUser.save();
        res.redirect(req.body.redirectPath);
    } catch (err) {
        req.flash("error", "Someting Went Wrong: " + err);
        res.redirect(req.body.redirectPath);   
        console.log(err);
    }
});

// unfollow
app.delete("/profiles/:id", checkAuthenticated, async (req, res) => {
    try {
        let followingUser = await User.findById(req.params.id);
        let followerUser = await User.findById(req.user.id);
        followerUser.following.pull(followingUser);
        await followerUser.save();
        res.redirect(req.body.redirectPath);
    } catch (err) {
        req.flash("error", "Someting Went Wrong: " + err);
        res.redirect(req.body.redirectPath);   
        console.log(err);
    }
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/posts");
    } else {
        next();
    }
}

app.listen(process.env.PORT, () => {
    console.log("the server is running on port " + process.env.PORT);
});