const Response = require("./Response");
const { NotificationModel } = require("../models/notification");

class Notification extends Response {
  handleAllNotificationsByAgreementId = async (req, res) => {
    try {
      const notifications = await NotificationModel.find({
        agreementId: req.params.id,
      });

      if (notifications.length === 0) {
        return res.status(404).json({
          message: "No notifications found matching the given agreementId",
        });
      }

      res.json({
        message: "Notifications retrieved successfully",
        notifications: notifications,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving notifications",
        data: { error: error.message },
      });
    }
  };

  handleAllNotificationsByUserId = async (req, res) => {
    try {
      const notifications = await NotificationModel.find({
        userId: req.params.id,
      }).populate("userId");

      if (notifications.length === 0) {
        return res.status(404).json({
          message: "No notifications found matching the given userId",
        });
      }

      res.json({
        message: "Notifications retrieved successfully",
        notifications: notifications,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving notifications",
        data: { error: error.message },
      });
    }
  };

  handleAllNotifications = async (req, res) => {
    try {
      const notifications = await NotificationModel.find({}).populate("userId");

      if (notifications.length === 0) {
        return res.status(404).json({
          message: "No notifications found",
        });
      }

      res.json({
        message: "Notifications retrieved successfully",
        notifications: notifications,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving notifications",
        data: { error: error.message },
      });
    }
  };

  handleUpdateNotificationStatus = async (req, res) => {
    try {
      const { id } = req.params; // Notification ID
      const { userId } = req.body; // User ID from the request body

      // Find the notification by its ID
      const notification = await NotificationModel.findById(id);

      if (!notification) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      // Check if the user has already read the notification
      const hasUserRead = notification.readBy.some(
        (reader) => reader.userId.toString() === userId
      );

      if (hasUserRead) {
        return res.status(400).json({
          message: "User has already read this notification",
        });
      }

      // Add the user to the readBy array
      notification.readBy.push({ userId, readAt: new Date() });

      // Save the updated notification
      await notification.save();

      res.json({
        message: "Notification status updated for the user",
        notification,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error updating notification status",
        data: { error: error.message },
      });
    }
  };
}

module.exports = Notification;
