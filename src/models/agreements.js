const mongoose = require("mongoose");

const agreementsSchema = new mongoose.Schema(
  {
    category: {
      type: String,
    },
    username: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    document: {
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

const AGREEMENTSMODEL = mongoose.model("AGREEMENTS", agreementsSchema);

module.exports = {
  AGREEMENTSMODEL,
};
