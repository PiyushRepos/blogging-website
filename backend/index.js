import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world", success: true });
});

// Routes
app.use("/auth", authRouter);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
