const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const {isLoggedIn, isAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

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
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Delete Review route
router.delete("/:reviewId", isLoggedIn, isAuthor,
  wrapAsync(reviewController.deleteReview)
);


module.exports = router;