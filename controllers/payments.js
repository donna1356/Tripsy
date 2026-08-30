const Listing = require("../models/listing");
const Payment = require("../models/payment");
const razorpay = require("../razorpayConfig");
const crypto = require("crypto");

module.exports.createOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    const amountInPaise = listing.price * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${listing._id}`,
      notes: {
        listingId: listing._id.toString(),
        userId: req.user._id.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      razorpay_order_id: order.id,
      amount: amountInPaise,
      currency: "INR",
      status: "created",
      listing: listing._id,
      user: req.user._id
    });

    await payment.save();

    res.json({
      order_id: order.id,
      currency: order.currency,
      amount: order.amount,
      key_id: process.env.RAZORPAY_KEY_ID,
      listing_id: listing._id,
      listing_title: listing.title,
      listing_price: listing.price
    });
  } catch (error) {
    console.error("Error creating order:", error);
    req.flash("error", "Failed to create payment order");
    res.redirect(`/listings/${req.params.id}`);
  }
};

module.exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      listing_id
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      await Payment.findOneAndUpdate(
        { razorpay_order_id },
        { 
          razorpay_payment_id,
          razorpay_signature,
          status: "failed"
        }
      );

      return res.status(400).json({ 
        success: false, 
        message: "Invalid signature" 
      });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpay_order_id },
      { 
        razorpay_payment_id,
        razorpay_signature,
        status: "paid"
      },
      { new: true }
    ).populate("listing").populate("user");

    req.flash("success", "Payment successful! Your booking is confirmed.");
    res.json({ 
      success: true, 
      message: "Payment verified successfully",
      redirect_url: `/listings/${listing_id}`
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed" 
    });
  }
};

module.exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("listing")
      .sort({ createdAt: -1 });

    res.render("payments/history.ejs", { payments });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    req.flash("error", "Failed to fetch payment history");
    res.redirect("/listings");
  }
};
