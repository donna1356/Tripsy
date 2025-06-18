const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate"); //helps us to create templates or layout
//for example we have multiple features that are common in many pages ex-navebar, footer
//so it will help us to create a template for that
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {ListingSchema} = require("./schema.js");

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


app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});

const validateListing = (req, res, next) => {
    const { error } = ListingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


//INDEX ROUTE
app.get("/listings", wrapAsync(async (req, res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//GET /listing/new -> this will open a form for us where we create a new listing
// when you submit the form, second request will go to create route, which will be POST request
// /listings, to create a new listing
//new route
app.get("/listings/new", wrapAsync(async(req, res) =>{
    res.render("listings/new.ejs");
}));

//The purpose of show route is to display all the information about a particular listing
//to perform READ operation of CRUD, READ : show route
//Show route
app.get("/listings/:id", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

//create route
app.post("/listings", validateListing, wrapAsync( async(req, res) =>{
    //let {title, description, image, price, location, country} = req.body;
    const newListing = new Listing(req.body.listing); //creates new instace of Listing
    await newListing.save(); //saved to database
    res.redirect("/listings");
     }));

//GET request at /listings/:id/edit, this will render a form
//on submitting the form, it will generate a PUT request to /listings/:id
//Edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update route
app.put("/listings/:id", validateListing, wrapAsync( async(req, res) =>{
    if(!req.body.listing)
    {
        throw new ExpressError(404, "Send valid data for listing");
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing}); 
    //deconstruct javascript object which has all the parameters
    //deconstruct means to covert all the parameters to individual values
    //and will pass these values to updated values
    res.redirect(`/listings/${id}`);
}));

//delete route
app.delete("/listings/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("deletedListing");
    res.redirect("/listings");
}));


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