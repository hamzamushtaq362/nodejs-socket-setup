const multer = require("multer");
const { AGREEMENTSMODEL } = require("../models/agreements");
const jwt = require("jsonwebtoken");
const pdfParse = require("pdf-parse");
class Agreements {
  constructor() {
    this.upload = multer({ storage: multer.memoryStorage() }).single(
      "document"
    );
  }

  handleUploadAgreement = async (req, res) => {
    this.upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          message: "Error uploading file",
          data: err.message,
        });
      }

      try {
        const { category, username, city, document } = req.body;
        const token = req.headers.authorization;

        if (!token) {
          return res.status(403).json({
            message: "Access Denied",
          });
        }

        const decoded = jwt.decode(token.split(" ")[1]);
        const userId = decoded?.id;

        const newAgreement = new AGREEMENTSMODEL({
          category,
          username,
          city,
          document,
          createdByUserId: userId,
        });

        await newAgreement.save();

        return res.status(201).json({
          message: "Agreement uploaded successfully",
          data: {
            category,
            username,
            city,
          },
        });
      } catch (error) {
        return res.status(500).json({
          message: "Error saving agreement",
          data: { error: error.message },
        });
      }
    });
  };

  deleteAgreement = async (req, res) => {
    try {
      const { id } = req.params;

      const deletedAgreement = await AGREEMENTSMODEL.findByIdAndDelete(id);

      if (!deletedAgreement) {
        return res.status(404).json({
          message: "Agreement not found",
        });
      }

      return res.status(200).json({
        message: "Agreement deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error deleting agreement",
        data: { error: error.message },
      });
    }
  };

  updateAgreement = async (req, res) => {
    this.upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({
          message: "Error uploading file",
          data: err.message,
        });
      }

      try {
        const { id } = req.params;
        const { category, username, city, document } = req.body;
        const token = req.headers.authorization;

        if (!token) {
          return res.status(403).json({
            message: "Access Denied",
          });
        }

        const decoded = jwt.decode(token.split(" ")[1]);
        const userId = decoded?.id;

        const existingAgreement = await AGREEMENTSMODEL.findById(id);

        if (!existingAgreement) {
          return res.status(404).json({
            message: "Agreement not found",
          });
        }

        if (category) existingAgreement.category = category;
        if (username) existingAgreement.username = username;
        if (city) existingAgreement.city = city;
        if (document) existingAgreement.document = document;

        existingAgreement.updatedByUserId = userId;

        await existingAgreement.save();

        return res.status(200).json({
          message: "Agreement updated successfully",
          data: {
            category: existingAgreement.category,
            username: existingAgreement.username,
            city: existingAgreement.city,
            document: existingAgreement?.document,
          },
        });
      } catch (error) {
        return res.status(500).json({
          message: "Error updating agreement",
          data: { error: error.message },
        });
      }
    });
  };

  handleRetrieveAgreement = async (req, res) => {
    try {
      const agreement = await AGREEMENTSMODEL.findById(req.params.id);
      if (!agreement) {
        return res.status(404).json({
          message: "Agreement not found",
        });
      }

      res.json({
        message: "Text extracted successfully",
        text: agreement.document,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving agreement",
        data: { error: error.message },
      });
    }
  };

  handleRetrieveAllAgreements = async (req, res) => {
    try {
      const agreements = await AGREEMENTSMODEL.find(); // Fetch all agreements

      if (agreements.length === 0) {
        return res.status(404).json({
          message: "No agreements found",
        });
      }

      res.json({
        message: "All agreements retrieved successfully",
        agreements: agreements, // Send all agreements back in the response
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving agreements",
        data: { error: error.message },
      });
    }
  };
}

module.exports = Agreements;
