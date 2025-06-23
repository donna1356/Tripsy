const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//reviews
//POST route
router.post("/", validateReview, wrapAsync(async(req, res) =>
{
    const listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

//Delete Review route
router.delete("/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review from the database
    await Review.findByIdAndDelete(reviewId);

    // Also remove the reference from the listing's reviews array
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});

    res.redirect(`/listings/${id}`);
  })
);


module.exports = router;