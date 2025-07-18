const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {ListingSchema} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
    if (req.method === "GET") {
        req.session.redirectUrl = req.originalUrl;
    } else if (req.method === "POST") {
        req.session.redirectUrl = "/listings"; // Safe redirect to form again
    }

    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
}
next();

}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session && !req.session.redirectUrl && req.originalUrl !== '/login') {
        req.session.redirectUrl = req.originalUrl;
    }
    res.locals.redirectUrl = req.session.redirectUrl; // save it to res.locals
    next();
};

module.exports.isOwner = async(req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You don't have permission to access this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isAuthor = async(req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    const { error } = ListingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
