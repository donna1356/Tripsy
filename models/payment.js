const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  razorpay_order_id: {
    type: String,
    required: true,
    unique: true
  },
  razorpay_payment_id: {
    type: String,
    required: false
  },
  razorpay_signature: {
    type: String,
    required: false
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: "INR"
  },
  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created"
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;
