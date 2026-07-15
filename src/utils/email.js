// Email utility - Dummy email sender (console.log based)
// Replace with actual email service (Nodemailer, SendGrid, etc.) for production

export const sendEmail = (to, subject, body, data = {}) => {
  console.log("========================================");
  console.log("📧 EMAIL NOTIFICATION");
  console.log("========================================");
  console.log(`📨 To: ${to}`);
  console.log(`📌 Subject: ${subject}`);
  console.log(`📝 Message: ${body}`);
  
  if (Object.keys(data).length > 0) {
    console.log(`📊 Data:`, data);
  }
  
  console.log("========================================");
  console.log("✅ Email sent successfully (dummy)");
  console.log("========================================");
  
  return true;
};

// Email templates
export const emailTemplates = {
  hiringRequest: (clientName, lawyerName) => ({
    subject: "New Hiring Request",
    body: `Hello ${lawyerName},\n\n${clientName} has sent you a hiring request on LegalEase.\n\nPlease login to your dashboard to accept or reject this request.\n\nThank you,\nLegalEase Team`,
  }),
  
  hiringAccepted: (clientName, lawyerName) => ({
    subject: "Hiring Request Accepted",
    body: `Hello ${clientName},\n\n${lawyerName} has accepted your hiring request on LegalEase.\n\nYou can now make the payment from your dashboard.\n\nThank you,\nLegalEase Team`,
  }),
  
  hiringRejected: (clientName, lawyerName) => ({
    subject: "Hiring Request Rejected",
    body: `Hello ${clientName},\n\n${lawyerName} has rejected your hiring request on LegalEase.\n\nYou can try hiring another lawyer.\n\nThank you,\nLegalEase Team`,
  }),
  
  paymentSuccess: (clientName, lawyerName, amount) => ({
    subject: "Payment Successful",
    body: `Hello ${clientName},\n\nYour payment of $${amount} to ${lawyerName} has been successful.\n\nThank you for using LegalEase!`,
  }),
  
  profilePublished: (lawyerName) => ({
    subject: "Profile Published",
    body: `Hello ${lawyerName},\n\nYour legal profile has been published successfully on LegalEase.\n\nClients can now find you on our platform.\n\nThank you,\nLegalEase Team`,
  }),
};