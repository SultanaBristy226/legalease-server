import Stripe from "stripe";
import HiringRequest from "../models/HiringRequest.js";
import Transaction from "../models/Transaction.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const { hiringId } = req.body;
    const hiring = await HiringRequest.findById(hiringId).populate("lawyer");
    
    if (!hiring) {
      return res.status(404).json({ message: "Hiring request not found" });
    }

    if (hiring.isPaid) {
      return res.status(400).json({ message: "Already paid" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: hiring.fee * 100,
      currency: "usd",
      metadata: {
        hiringId: hiring._id.toString(),
        userId: req.user._id.toString(),
        lawyerId: hiring.lawyer._id.toString(),
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment intent error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const hiringId = paymentIntent.metadata.hiringId;
    const hiring = await HiringRequest.findById(hiringId);
    
    if (!hiring) {
      return res.status(404).json({ message: "Hiring request not found" });
    }

    if (hiring.isPaid) {
      return res.status(400).json({ message: "Already paid" });
    }

    hiring.isPaid = true;
    hiring.transactionId = `TXN-${Date.now()}`;
    await hiring.save();

    await Transaction.create({
      transactionId: hiring.transactionId,
      user: req.user._id,
      lawyer: hiring.lawyer,
      hiringRequest: hiring._id,
      amount: hiring.fee,
    });

    res.status(200).json({ 
      message: "Payment successful", 
      hiring,
      transactionId: hiring.transactionId 
    });
  } catch (error) {
    console.error("Confirm payment error:", error.message);
    res.status(500).json({ message: error.message });
  }
};