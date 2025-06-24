const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate"); //helps us to create templates or layout
//for example we have multiple features that are common in many pages ex-navebar, footer
//so it will help us to create a template for that
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const users = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true})); //parse the data present in the request
app.use(methodOverride('_method')); //converts POST request to PUT request in edit.ejs form
app.engine("ejs", ejsMate); //tells express to use ejs-mate to handle ejs files
//ejsMate - rendering engine that adds layout to ejs
app.use(express.static(path.join(__dirname, "/public")));//this is to serve static files to public folders
//uses style.css static files inside public folders inside css folders to serve to public folders
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
};


app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});  


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new 
    LocalStrategy(User.authenticate()));//this lines means
//every user should be authenticated using local stratigey and
//the method used to authenthicate is authenticate(), which is a static method 
//provided by mongoose

passport.serializeUser(User.serializeUser());//to store all info related to the user in the session
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews); //parent route

app.use("/", users);

app.all("/*splat", (req, res, next) =>{
    next(new ExpressError(404, "Page Not Found!!"));
});


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", {err});
    //res.status(statusCode).send(message);
});



app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});