const Listing = require("../models/listing");
const Review = require("../models/review");


module.exports.createReview = async(req, res) =>
{
    const listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Added!");
    res.redirect(`/listings/${listing._id}`);
};


module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove the review from the database
    await Review.findByIdAndDelete(reviewId);

    // Also remove the reference from the listing's reviews array
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
  };