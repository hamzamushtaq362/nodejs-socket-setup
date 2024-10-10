const router = require("express").Router();
const { ClientAgreements } = require("../handler");
const handler = new ClientAgreements();

router.post("/client-agreement", handler.handleUploadClientAgreement);
router.get("/client-agreement/:id", handler.handleRetrieveClientAgreement);
router.get("/client-agreement", handler.getAllClientAgreements);
router.put("/client-agreement/:id", handler.updateClientAgreement);
router.delete("/client-agreement/:id", handler.deleteClientAgreement);
router.get("/client-agreement/verify-code/:code", handler.verifyCode);

module.exports = router;
