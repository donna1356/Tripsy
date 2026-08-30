const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
let geocodingClient = null;

if (mapToken && mapToken !== "your_mapbox_token_here") {
  try {
    geocodingClient = mbxGeocoding({ accessToken: mapToken });
  } catch (error) {
    console.warn("Failed to initialize Mapbox geocoding client:", error.message);
  }
}

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.searchListings = async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.redirect("/listings");
  }

  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  const searchResults = await Listing.find({
    $or: [
      { location: { $regex: query, $options: 'i' } },
      { country: { $regex: query, $options: 'i' } },
      { title: { $regex: query, $options: 'i' } },
      { tags: { $in: searchTerms } },
      { description: { $regex: query, $options: 'i' } }
    ]
  }).populate("owner");

  res.render("listings/search.ejs", { 
    searchResults, 
    query,
    count: searchResults.length 
  });
};

module.exports.newForm = async (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you are requesting for does not exist");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", {
    listing,
    mapToken
  });
};

module.exports.createListing = async (req, res, next) => {
  const listingData = { ...req.body.listing };
  
  // Process tags if provided
  if (listingData.tags) {
    listingData.tags = listingData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
  }
  
  const newListing = new Listing(listingData);
  newListing.owner = req.user._id;

  if (geocodingClient) {
    try {
      const response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      }).send();

      if (response.body.features.length > 0) {
        newListing.geometry = response.body.features[0].geometry;
      } else {
        newListing.geometry = {
          type: "Point",
          coordinates: [0, 0]
        };
      }
    } catch (error) {
      console.warn("Geocoding failed:", error.message);
      newListing.geometry = {
        type: "Point",
        coordinates: [0, 0]
      };
    }
  } else {
    newListing.geometry = {
      type: "Point",
      coordinates: [0, 0]
    };
  }

  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.editForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you are requesting for does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  const listingData = { ...req.body.listing };
  
  // Process tags if provided
  if (listingData.tags) {
    listingData.tags = listingData.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
  }
  
  let listing = await Listing.findByIdAndUpdate(id, listingData);
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }
  req.flash("success", "Listing Edited!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};