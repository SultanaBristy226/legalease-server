export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    console.log("🔍 Confirming payment:", paymentIntentId);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("🔍 Payment intent status:", paymentIntent.status);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ 
        message: `Payment not completed. Status: ${paymentIntent.status}` 
      });
    }

    const hiringId = paymentIntent.metadata.hiringId;
    console.log("🔍 Hiring ID:", hiringId);

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

    console.log("✅ Payment confirmed successfully!");

    res.status(200).json({ 
      message: "Payment successful", 
      hiring,
      transactionId: hiring.transactionId 
    });
  } catch (error) {
    console.error("❌ Confirm payment error:", error.message);
    res.status(500).json({ message: error.message });
  }
};