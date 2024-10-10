const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User", // Assuming you have a User model
    },
    agreementId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "ClientAgreement", // Assuming the ClientAgreement model is defined
    },
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "unread",
    },
    readBy: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model("Notification", notificationSchema);

module.exports = {
  NotificationModel,
};
