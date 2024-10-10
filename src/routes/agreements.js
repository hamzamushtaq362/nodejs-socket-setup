const router = require("express").Router();
const { Agreements } = require("../handler");
const handler = new Agreements();

router.post("/agreement", handler.handleUploadAgreement);
router.get("/agreement/:id", handler.handleRetrieveAgreement);
router.get("/agreement", handler.handleRetrieveAllAgreements);
router.put("/agreement/:id", handler.updateAgreement);
router.delete("/agreement/:id", handler.deleteAgreement);

module.exports = router;
