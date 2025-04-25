import { PrismaClient } from "@prisma/client";
import { loginSchema, registerSchema } from "../schema.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util.js";
import { NODE_ENV } from "../config/envs.js";
const prisma = new PrismaClient();

export const registerUser = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const data = registerSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({
      success: false,
      error: { message: data.error.issues[0].message },
    });
  }

  const {
    data: { email, name, password },
  } = data;

  let newUser;
  try {
    const userExists = await prisma.user.findFirst({ where: { email } });
    if (userExists) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
  } catch (error) {
    console.log("Error while registering user", error);
    return res
      .status(500)
      .json({ success: false, message: "Error while registering user" });
  }

  return res.status(201).json({
    success: true,
    userId: newUser.id,
    message: "Registration completed",
  });
};

export const loginUser = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const data = loginSchema.safeParse(req.body);
  if (!data.success) {
    return res.status(400).json({
      success: false,
      error: { message: data.error.issues[0].message },
    });
  }

  const {
    data: { email, password },
  } = data;

  try {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    const accessToken = await generateAccessToken({ id: user.id }, res);
    const refreshToken = await generateRefreshToken(
      { id: user.id, email: user.email },
      res
    );

    const loggedInUser = await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const options = {
      httpOnly: true,
      secure: NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: NODE_ENV === "production" ? "none" : "strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, {
        ...options,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/refresh-token",
      })
      .json({
        success: true,
        data: loggedInUser,
        message: "User logged in successfully",
      });
  } catch (error) {
    console.log("Error while logging user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getCurrentLoggedInUser = async () => {};
