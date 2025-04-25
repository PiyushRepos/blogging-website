import { PrismaClient } from "@prisma/client";
import { registerSchema } from "../schema.js";
import { hashPassword } from "../utils/bcrypt.util.js";
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

export const loginUser = async () => {};
export const getCurrentLoggedInUser = async () => {};
