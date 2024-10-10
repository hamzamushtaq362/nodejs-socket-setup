const mongoose = require("mongoose");

const clientAgreementsSchema = new mongoose.Schema(
  {
    client_name: {
      type: String,
    },
    site_name: {
      type: String,
    },
    status: {
      type: String,
      enum: ["done", "pending"],
      default: "pending",
    },
    city: {
      type: String,
    },
    category: {
      type: String,
    },
    document: {
      type: String,
    },
    agreementCode: {
      type: String,
    },
    createdByUserId: {
      type: mongoose.Types.ObjectId,
    },
    updatedByUserId: {
      type: mongoose.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const CLIENTAGREEMENTSMODEL = mongoose.model(
  "CLIENTAGREEMENT",
  clientAgreementsSchema
);

module.exports = {
  CLIENTAGREEMENTSMODEL,
};
