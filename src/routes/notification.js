const router = require("express").Router();
const { Notification } = require("../handler");
const handler = new Notification();

router.get("/notification-by-agreement/:id", handler.handleAllNotificationsByAgreementId);
router.get("/notification-by-user/:id", handler.handleAllNotificationsByUserId);
router.get("/notification", handler.handleAllNotifications);
router.put("/notification/:id/read", handler.handleUpdateNotificationStatus);

module.exports = router;
