import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INFO_FILE = path.join(__dirname, "user-info.json");
const EXPERIENCES_FILE = path.join(__dirname, "experiences.json");
const CONNECTIONS_FILE = path.join(__dirname, "connections.json");
const RECENT_SERCH_FILE = path.join(__dirname, "recentSearch.json");
const ABOUT_FILE = path.join(__dirname, "about.json");
const NOTIFICATIONS_FILE = path.join(__dirname, "notifications.json");
const EDUCATIONS_FILE = path.join(__dirname, "educations.json");
const allowedOrigins = [
    "https://bi151103.github.io",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:4200",
    "http://localhost:4200",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("CORS not allowed to access."));
        }
    },
};
app.use(cors(corsOptions));
app.use(express.json());
const readFromFile = (filePath, defaultValue) => {
    if (!fs.existsSync(filePath)) {
        return defaultValue;
    }
    const rawData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(rawData);
};
app.get("/api/user/info", (req, res) => {
    try {
        const data = readFromFile(INFO_FILE, {
            id: "",
            firstName: "",
            lastName: "",
            showEducation: false,
            industry: "",
            country: "",
            location: "",
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read info data" });
    }
});
app.post("/api/user/info", (req, res) => {
    try {
        const newData = req.body;
        fs.writeFileSync(INFO_FILE, JSON.stringify(newData, null, 2), "utf8");
        res
            .status(200)
            .json({ message: "Update info successfully", status: "success" });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to save info data", status: "error" });
    }
});
app.get("/api/connections", (req, res) => {
    try {
        const data = readFromFile(CONNECTIONS_FILE, []);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read connections" });
    }
});
app.get("/api/experiences", (req, res) => {
    try {
        const data = readFromFile(EXPERIENCES_FILE, []);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read experiences data" });
    }
});
app.post("/api/experiences", (req, res) => {
    try {
        const newData = req.body;
        fs.writeFileSync(EXPERIENCES_FILE, JSON.stringify(newData, null, 2), "utf8");
        res.json({ message: "Update experiences successfully", data: newData });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to save experiences data" });
    }
});
app.get("/api/recent-search", (req, res) => {
    try {
        const data = readFromFile(RECENT_SERCH_FILE, {
            count: 0,
            data: [],
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read recent search data" });
    }
});
app.post("/api/remove-recent-search", (req, res) => {
    try {
        const itemDeletedList = req.body;
        const current = readFromFile(RECENT_SERCH_FILE, {
            count: 0,
            data: [],
        });
        const data = current.data.filter((item) => !itemDeletedList.includes(item));
        const newData = {
            count: data.length,
            data,
        };
        fs.writeFileSync(RECENT_SERCH_FILE, JSON.stringify(newData, null, 2), "utf8");
        res.json({ message: "Update recent search successfully", data: newData });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to save experiences data" });
    }
});
app.get("/api/about", (req, res) => {
    try {
        const data = readFromFile(ABOUT_FILE, { data: "" });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read about data" });
    }
});
app.get("/api/notifications/messages", (req, res) => {
    try {
        const data = readFromFile(NOTIFICATIONS_FILE, {
            data: [],
        });
        const items = data.data.filter((item) => item.type === "message");
        res.json({ count: items.length, data: items });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read message notifications" });
    }
});
app.get("/api/notifications/network", (req, res) => {
    try {
        const data = readFromFile(NOTIFICATIONS_FILE, {
            data: [],
        });
        const items = data.data.filter((item) => item.type === "network");
        res.json({ count: items.length, data: items });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read network notifications" });
    }
});
app.get("/api/notifications/general", (req, res) => {
    try {
        const data = readFromFile(NOTIFICATIONS_FILE, {
            data: [],
        });
        const items = data.data.filter((item) => item.type === "notification");
        res.json({ count: items.length, data: items });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read notifications" });
    }
});
app.get("/api/educations", (req, res) => {
    try {
        const data = readFromFile(EDUCATIONS_FILE, {
            count: 0,
            data: [],
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read educations data" });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
