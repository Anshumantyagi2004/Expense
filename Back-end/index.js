// server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import mainRoute from "./src/routes/mainRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    // origin: "https://expense-q8e5.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

connectDB();

app.use("/", mainRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));