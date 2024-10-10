const router = require("express").Router();

const user = require("./user");
const agreements = require("./agreements");
const clientAgreements = require("./clientAgreements");
const notification = require("./notification");

router.use("/", user);
router.use("/", agreements);
router.use("/", clientAgreements);
router.use("/", notification);

module.exports = { router };
