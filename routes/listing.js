const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage}); //to initialize, where to save files from forms.


router.
route("/")
.get( wrapAsync(listingController.index)) //INDEX ROUTE
.post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing)); //create route



//GET /listing/new -> this will open a form for us where we create a new listing
// when you submit the form, second request will go to create route, which will be POST request
// /listings, to create a new listing
//new route
router.get("/new", isLoggedIn, wrapAsync(listingController.newForm));


router.
route("/:id")
.get( wrapAsync(listingController.showListing)) //show route
//The purpose of show route is to display all the information about a particular listing
//to perform READ operation of CRUD, READ : show route
.put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing)) //update route
.delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing)); //delete route



//GET request at /listings/:id/edit, this will render a form
//on submitting the form, it will generate a PUT request to /listings/:id
//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editForm));




module.exports = router;
