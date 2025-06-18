const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema for listing(collection)
const ListingSchema = new Schema({
    title : 
    {
        type : String,
        required : true,
    },
    description : String,
    image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default: "https://unsplash.com/photos/the-sun-is-setting-over-the-ocean-on-a-clear-day-oIOoPgL1S5M",
      set: (v) =>
        v === ""
          ? "https://unsplash.com/photos/the-sun-is-setting-over-the-ocean-on-a-clear-day-oIOoPgL1S5M"
          : v,
    },
    },
    price : Number,
    location : String,
    country : String,
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;