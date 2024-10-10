const Response = require("./Response");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/user");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

class User extends Response {
  signup = async (req, res) => {
    try {
      const { email, username, password, city, role, branch } = req.body;
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return this.sendResponse(req, res, {
          message: "User already exists",
          status: 400,
        });
      }

      const newUser = new UserModel({
        email,
        username,
        password,
        city,
        role,
        branch,
      });

      await newUser.save();

      // Optionally log the creation event
      // auditLogger("User signup", { userId: newUser._id });

      return this.sendResponse(req, res, {
        message: "User registered successfully",
        status: 201,
        data: { email, username, city, role, branch },
      });
    } catch (error) {
      return this.sendResponse(req, res, {
        message: "Error registering user",
        status: 500,
        data: { error: error.message },
      });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        return this.sendResponse(req, res, {
          message: "Invalid credentials",
          status: 400,
        });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return this.sendResponse(req, res, {
          message: "Invalid credentials",
          status: 400,
        });
      }

      const token = jwt.sign(
        {
          id: user._id,
          username: user?.username,
          role: user.role,
          city: user.city,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      const userId = user._id;
      const userRole = user.role;
      const userCity = user?.city;
      const userName = user?.username;
      return this.sendResponse(req, res, {
        message: "Logged in successfully",
        status: 200,
        data: { token, userId, userRole, userCity, userName },
      });
    } catch (error) {
      return this.sendResponse(req, res, {
        message: "Error logging in",
        status: 500,
        data: { error: error.message },
      });
    }
  };

  updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { username, password, city, role, branch } = req.body;

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
          status: 404,
        });
      }

      if (username) user.username = username;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
      if (city) user.city = city;
      if (role) user.role = role;
      if (branch) user.branch = branch;

      await user.save();

      return res.status(200).json({
        message: "User updated successfully",
        status: 200,
        data: {
          username: user.username,
          city: user.city,
          role: user.role,
        },
      });
    } catch (error) {
      // return this.sendResponse(req, res, {
      //   message: "Error updating user",
      //   status: 500,
      //   data: { error: error.message },
      // });
      return res.status(500).json({
        message: "Error updating user",
        status: 500,
        data: { error: error.message },
      });
    }
  };
  // Get all users
  getAllUsers = async (req, res) => {
    try {
      const users = await UserModel.find({}, "-password");
      return this.sendResponse(req, res, {
        message: "Users retrieved successfully",
        status: 200,
        data: users,
      });
    } catch (error) {
      return this.sendResponse(req, res, {
        message: "Error retrieving users",
        status: 500,
        data: { error: error.message },
      });
    }
  };
  deleteUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      if (!user) {
        return this.sendResponse(req, res, {
          message: "User not found",
          status: 404,
        });
      }

      await user.remove();
      return this.sendResponse(req, res, {
        message: "User deleted successfully",
        status: 200,
      });
    } catch (error) {
      return this.sendResponse(req, res, {
        message: "Error deleting user",
        status: 500,
        data: { error: error.message },
      });
    }
  };

  // deleteUser = async (req, res) => {
  //   try {
  //     const { id } = req.params;

  //     const user = await UserModel.findById(id);
  //     if (!user) {
  //       return this.sendResponse(req, res, {
  //         message: "User not found",
  //         status: 404,
  //       });
  //     }

  //     await user.remove();

  //     return this.sendResponse(req, res, {
  //       message: "User deleted successfully",
  //       status: 200,
  //     });
  //   } catch (error) {
  //     return this.sendResponse(req, res, {
  //       message: "Error deleting user",
  //       status: 500,
  //       data: { error: error.message },
  //     });
  //   }
  // };
}

module.exports = User;
