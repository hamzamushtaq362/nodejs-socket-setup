const multer = require("multer");
const { getSocket } = require("../../socketManager");
const CryptoJS = require("crypto-js");

const secretKey = process.env.AGREEMENT_SECRET || "mySecretKey0123456123456789";

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const QRCode = require("qrcode");

// Function to encrypt an object
const encryptObject = (obj) => {
  const jsonString = JSON.stringify(obj);
  const encrypted = CryptoJS.AES.encrypt(jsonString, secretKey).toString();

  // Replace special characters to make it URL-safe
  const urlSafeEncrypted = encrypted
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, ""); // Remove padding '='

  return urlSafeEncrypted;
};

const decryptObject = (urlSafeEncrypted) => {
  // Reverse the URL-safe encoding back to base64
  const base64Encrypted = urlSafeEncrypted
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const decryptedBytes = CryptoJS.AES.decrypt(base64Encrypted, secretKey);
  const decryptedData = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

  return decryptedData;
};

const { CLIENTAGREEMENTSMODEL, NotificationModel } = require("../models");

class ClientAgreements {
  constructor() {
    this.upload = multer({ storage: multer.memoryStorage() }).single(
      "document"
    );
  }

  handleUploadClientAgreement = async (req, res) => {
    this.upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          message: "Error uploading file",
          data: err.message,
        });
      }

      try {
        const { client_name, site_name, status, category, city, document } =
          req.body;
        const token = req.headers.authorization;

        if (!token) {
          return res.status(403).json({
            message: "Access Denied",
          });
        }

        const decoded = jwt.decode(token.split(" ")[1]);
        const userId = decoded?.id;

        const generateAgreementCode = (clientName) => {
          return `AGREEMENT-${clientName}-${Date.now()}`;
        };

        // Create new client agreement
        const newClientAgreement = new CLIENTAGREEMENTSMODEL({
          client_name,
          site_name,
          status,
          city,
          category,
          document,
          agreementCode: "",
          createdByUserId: userId,
        });

        const savedAgreement = await newClientAgreement.save();

        // Encrypt the data
        const agreementCode = encryptObject({
          id: savedAgreement?._id,
          client_name,
          createdByUserId: userId,
        });

        // Generate the QR code
        const qrCode = await QRCode.toDataURL(
          `https://sb-verified-page.vercel.app/verified/${agreementCode}`
        );

        const topHeader = `
            <div style='display: flex; justify-content: space-between; align-items: center;'>
              <div>
                <h1 style='color:#d3d3d3;'>Syed Brothers</h1>
                <p>info@syedbrother</p>
                <p>03xx-xxxxxxx</p>
              </div>
              <div>
                <img src="${qrCode}" alt="QR Code" width="100" height="100" />
              </div>
            </div>
          `;

        savedAgreement.document = topHeader + document;
        savedAgreement.agreementCode = agreementCode;
        await savedAgreement.save(); // Save the updated agreement

        // Save the notification in the database
        const notification = new NotificationModel({
          userId: userId,
          agreementId: newClientAgreement._id,
          text: `New ${category} agreement added by ${decoded?.username} in ${city}`,
        });

        await notification.save();

        // Emit a notification to the admin and super-admin
        const io = getSocket();
        io.emit("notification", {
          message: `New ${category} agreement added by ${decoded?.username} in ${city}`,
          type: "userRegistration",
          city: city,
        });

        return res.status(201).json({
          message: "Client Agreement uploaded successfully",
          data: {
            client_name,
            site_name,
            status,
            category,
            city,
            document,
            agreementCode,
          },
        });
      } catch (error) {
        return res.status(500).json({
          message: "Error saving client agreement",
          data: { error: error.message },
        });
      }
    });
  };

  deleteClientAgreement = async (req, res) => {
    try {
      const { id } = req.params;
      const existingAgreement = await CLIENTAGREEMENTSMODEL.findById(id);
      const deletedUser = { username: existingAgreement?.client_name };
      const token = req.headers.authorization;

      if (!token) {
        return res.status(403).json({
          message: "Access Denied",
        });
      }

      const decoded = jwt.decode(token.split(" ")[1]);
      const userId = decoded?.id;

      // console.log("decoded", decoded);
      const deletedAgreement = await CLIENTAGREEMENTSMODEL.findByIdAndDelete(
        id
      );

      if (!deletedAgreement) {
        return res.status(404).json({
          message: "Client Agreement not found",
        });
      }

      // Save the notification in the database
      const notification = new NotificationModel({
        userId: userId,
        agreementId: existingAgreement._id,
        text: `${deletedUser.username} deleted by ${decoded?.username} (${decoded?.role}).`,
      });

      await notification.save();

      // Emit a notification to the admin
      const io = getSocket();

      io.emit("notification", {
        message: `${deletedUser.username} deleted by ${decoded?.username} (${decoded?.role}).`,
        type: "userDelete",
        city: existingAgreement?.city,
      });

      return res.status(200).json({
        message: "Client Agreement deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error deleting client agreement",
        data: { error: error.message },
      });
    }
  };

  updateClientAgreement = async (req, res) => {
    this.upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          message: "Error uploading file",
          data: err.message,
        });
      }

      try {
        const { id } = req.params;
        const { client_name, site_name, status, city, category, document } =
          req.body;
        const token = req.headers.authorization;

        if (!token) {
          return res.status(403).json({
            message: "Access Denied",
          });
        }

        const decoded = jwt.decode(token.split(" ")[1]);
        const userId = decoded?.id;

        const existingAgreement = await CLIENTAGREEMENTSMODEL.findById(id);

        if (!existingAgreement) {
          return res.status(404).json({
            message: "Client Agreement not found",
          });
        }

        if (client_name) existingAgreement.client_name = client_name;
        if (site_name) existingAgreement.site_name = site_name;
        if (status) existingAgreement.status = status;
        if (category) existingAgreement.category = category;
        if (city) existingAgreement.city = city;
        if (document) existingAgreement.document = document;

        existingAgreement.updatedByUserId = userId;

        await existingAgreement.save();
        // Emit a notification to the admin
        console.log(existingAgreement.city);
        const io = getSocket();

        if (status === "done") {
          // Save the notification in the database
          const statusNotification = new NotificationModel({
            userId: userId,
            agreementId: existingAgreement._id,
            text: `${existingAgreement.client_name} agreement done by ${decoded?.username} (${decoded?.role}).`,
          });

          await statusNotification.save();

          io.emit("notification", {
            message: `${existingAgreement.client_name} agreement done by ${decoded?.username} (${decoded?.role}).`,
            type: "statusUpdate",
            city: existingAgreement?.city,
            id: existingAgreement.createdByUserId,
          });
        } else {
          // Save the notification in the database
          const notification = new NotificationModel({
            userId: userId,
            agreementId: existingAgreement._id,
            text: `${existingAgreement.client_name} edit by ${decoded?.username} (${decoded?.role}).`,
          });

          await notification.save();

          io.emit("notification", {
            message: `${existingAgreement.client_name} edit by ${decoded?.username} (${decoded?.role}).`,
            type: "userUpdate",
            id: existingAgreement.createdByUserId,
          });

          // Convert to string
          const idString = existingAgreement?.createdByUserId.toHexString();
          // if (decoded?.id !== idString) {
          //   // Save the notification in the database
          //   const notification = new NotificationModel({
          //     userId: userId,
          //     agreementId: existingAgreement._id,
          //     text: `${existingAgreement.client_name} edit by ${decoded?.username} (${decoded?.role}).`,
          //   });

          //   await notification.save();

          //   io.emit("notification", {
          //     message: `${existingAgreement.client_name} edit by ${decoded?.username} (${decoded?.role}).`,
          //     type: "userUpdatedBy",
          //     id: existingAgreement.createdByUserId,
          //   });
          // }
        }

        return res.status(200).json({
          message: "Client Agreement updated successfully",
          data: {
            client_name: existingAgreement.client_name,
            site_name: existingAgreement.site_name,
            status: existingAgreement.status,
            category: existingAgreement.category,
            city: existingAgreement.city,
            document: existingAgreement?.document,
          },
        });
      } catch (error) {
        return res.status(500).json({
          message: "Error updating client agreement",
          data: { error: error.message },
        });
      }
    });
  };

  handleRetrieveClientAgreement = async (req, res) => {
    try {
      const agreement = await CLIENTAGREEMENTSMODEL.findById(req.params.id);
      if (!agreement) {
        return res.status(404).json({
          message: "Client Agreement not found",
        });
      }

      res.json({
        message: "Text extracted successfully",
        text: agreement.document,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving client agreement",
        data: { error: error.message },
      });
    }
  };

  getAllClientAgreements = async (req, res) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(403).json({
          message: "Access Denied",
        });
      }
      const decoded = jwt.decode(token.split(" ")[1]);
      const userId = decoded?.id;
      const role = decoded?.role;
      const city = decoded?.city;

      if (role === "Super-Admin") {
        const clientAgreements = await CLIENTAGREEMENTSMODEL.find();
        if (clientAgreements.length === 0) {
          return res.status(404).json({
            message: "No client agreements found",
          });
        }
        const cleanResponse = clientAgreements.map((item) => {
          const obj = item.toObject ? item.toObject() : item._doc || item;
          const { document, ...filteredObj } = obj;

          return filteredObj;
        });
        return res.status(200).json({
          message: "Client agreements retrieved successfully",
          data: cleanResponse,
        });
      } else if (role === "Marketer") {
        const clientAgreements = await CLIENTAGREEMENTSMODEL.find({
          createdByUserId: userId,
        });
        if (clientAgreements.length === 0) {
          return res.status(404).json({
            message: "No client agreements found",
          });
        }
        const cleanResponse = clientAgreements.map((item) => {
          const obj = item.toObject ? item.toObject() : item._doc || item;
          const { document, ...filteredObj } = obj;

          return filteredObj;
        });
        return res.status(200).json({
          message: "Client agreements retrieved successfully",
          data: cleanResponse,
        });
      } else if (role === "Admin") {
        const clientAgreements = await CLIENTAGREEMENTSMODEL.find({
          city: city,
        });
        if (clientAgreements.length === 0) {
          return res.status(404).json({
            message: "No client agreements found",
          });
        }
        const cleanResponse = clientAgreements.map((item) => {
          const obj = item.toObject ? item.toObject() : item._doc || item;
          const { document, ...filteredObj } = obj;

          return filteredObj;
        });
        return res.status(200).json({
          message: "Client agreements retrieved successfully",
          data: cleanResponse,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving client agreements",
        data: { error: error.message },
      });
    }
  };

  verifyCode = async (req, res) => {
    try {
      const { code } = req.params;
      const decryptedData = decryptObject(code);

      const agreement = await CLIENTAGREEMENTSMODEL.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(decryptedData?.id) },
        },
        {
          $project: {
            agreementCode: 0,
          },
        },
      ]);

      if (agreement.length === 0) {
        return res.status(404).json({
          message: "Client Agreement not found",
        });
      }

      if (agreement) {
        return res.status(200).json({
          message: "Client Agreement Matched",
          data: {
            agreement: agreement[0],
            redirectUrl: `https://yourwebsite.com`,
          },
        });
      } else {
        return res.status(404).json({ message: "Agreement code not found" });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Error verifying code",
        data: { error: error.message },
      });
    }
  };
}

module.exports = ClientAgreements;
