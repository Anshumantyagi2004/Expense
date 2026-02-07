// server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import mainRoute from "./src/routes/mainRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
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