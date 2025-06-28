const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

//Schema for listing(collection)
const ListingSchema = new Schema({
    title : 
    {
        type : String,
        required : true,
    },
    description : String,
    image: {
      url: String,
      filename: String,
  },
    price : Number,
    location : String,
    country : String,

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
});

//this is a post middleware
ListingSchema.post("findOneAndDelete", async(listing) =>{

  if(listing){
  await Review.deleteMany({_id: {$in: listing.reviews}});
  }
  //this line basically means that we are going to delete all the reviews
  //that are in the review array of the particualr listing that is deleted.
});


const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;