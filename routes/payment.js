const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const paymentController = require("../controllers/payments.js");

router.post("/listings/:id/create-order", isLoggedIn, wrapAsync(paymentController.createOrder));
router.post("/verify-payment", isLoggedIn, wrapAsync(paymentController.verifyPayment));
router.get("/payments/history", isLoggedIn, wrapAsync(paymentController.getPaymentHistory));

module.exports = router;
