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
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
  type: String,
  default: "https://plus.unsplash.com/premium_photo-1676497581000-763997b7c457?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  set: function (v) {
    if (v === undefined || v.trim() === "") {
      return "https://plus.unsplash.com/premium_photo-1676497581000-763997b7c457?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    }
    return v;
       }
     },
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