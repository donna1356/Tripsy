const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {ListingSchema} = require("../schema.js");
const Listing = require("../models/listing");

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
router.get("/", wrapAsync(async (req, res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//GET /listing/new -> this will open a form for us where we create a new listing
// when you submit the form, second request will go to create route, which will be POST request
// /listings, to create a new listing
//new route
router.get("/new", wrapAsync(async(req, res) =>{
    res.render("listings/new.ejs");
}));

//The purpose of show route is to display all the information about a particular listing
//to perform READ operation of CRUD, READ : show route
//Show route
router.get("/:id", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));

//create route
router.post("/", validateListing, wrapAsync( async(req, res) =>{
    //let {title, description, image, price, location, country} = req.body;
    const newListing = new Listing(req.body.listing); //creates new instace of Listing
    await newListing.save(); //saved to database
    res.redirect("/listings");
     }));

//GET request at /listings/:id/edit, this will render a form
//on submitting the form, it will generate a PUT request to /listings/:id
//Edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update route
router.put("/:id", validateListing, wrapAsync( async(req, res) =>{
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
router.delete("/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;
