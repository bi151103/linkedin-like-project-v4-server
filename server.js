const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const INFO_FILE = path.join(__dirname, "user-info.json");
const EXPERIENCES_FILE = path.join(__dirname, "experiences.json");
const CONNECTIONS_FILE = path.join(__dirname, "connections.json");

const allowedOrigins = ["https://bi151103.github.io", "http://127.0.0.1:5500"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed to access."));
      }
    },
  }),
);

app.use(express.json());

const readFromFile = (filePath, defaultValue) => {
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  const rawData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(rawData);
};

app.get("/api/info", (req, res) => {
  try {
    const data = readFromFile(INFO_FILE, {
      firstName: "",
      lastName: "",
      education: "",
      showEducation: false,
      industry: "",
      country: "",
      location: "",
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to read info data" });
  }
});

app.post("/api/info", (req, res) => {
  try {
    const newData = req.body;
    fs.writeFileSync(INFO_FILE, JSON.stringify(newData, null, 2), "utf8");
    res.json({ message: "Update info successfully", data: newData });
  } catch (error) {
    res.status(500).json({ message: "Failed to save info data" });
  }
});

app.get("/api/connections", (req, res) => {
  try {
    const data = readFromFile(CONNECTIONS_FILE, []);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to read connections" });
  }
});

app.get("/api/experiences", (req, res) => {
  try {
    const data = readFromFile(EXPERIENCES_FILE, []);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to read experiences data" });
  }
});

app.post("/api/experiences", (req, res) => {
  try {
    const newData = req.body;

    fs.writeFileSync(
      EXPERIENCES_FILE,
      JSON.stringify(newData, null, 2),
      "utf8",
    );

    res.json({ message: "Update experiences successfully", data: newData });
  } catch (error) {
    res.status(500).json({ message: "Failed to save experiences data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
