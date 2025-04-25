import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_RERESH_TOKEN_SECRET,
} from "../config/envs.js";

export const generateAccessToken = async (payload, res) => {
  try {
    return await jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
  } catch (error) {
    console.log("Error generating access token:", error);
    res.status(500).json({
      message: "Error generating access token",
      error: error.message,
    });
  }
};

export const generateRefreshToken = async (payload, res) => {
  try {
    return await jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: "30d",
    });
  } catch (error) {
    console.log("Error generating refresh token:", error);
    res.status(500).json({
      message: "Error generating refresh token",
      error: error.message,
    });
  }
};
