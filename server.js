import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
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
const FEATURES_FILE = path.join(__dirname, "features.json");
const COMPANIES_FILE = path.join(__dirname, "companies.json");
const GROUPS_FILE = path.join(__dirname, "groups.json");
const INSTITUTIONS_FILE = path.join(__dirname, "institutions.json");
const JOBS_FILE = path.join(__dirname, "jobs.json");
const PEOPLE_FILE = path.join(__dirname, "people.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `feature-${uniqueSuffix}${ext}`);
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});
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
app.use("/uploads", cors(corsOptions), express.static(UPLOADS_DIR));
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
        res.status(200).json({
            message: "Update recent search successfully",
            status: "success",
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to update recent search", status: "error" });
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
app.post("/api/about", (req, res) => {
    try {
        const newData = req.body;
        fs.writeFileSync(ABOUT_FILE, JSON.stringify(newData, null, 2), "utf8");
        res
            .status(200)
            .json({ message: "Update about successfully", status: "success" });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to save about data", status: "error" });
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
app.get("/api/features", (req, res) => {
    try {
        const data = readFromFile(FEATURES_FILE, {
            count: 0,
            data: [],
        });
        const sortedFeatures = data.data.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        res.json({
            count: data.count,
            data: sortedFeatures,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read features data" });
    }
});
app.post("/api/features", upload.single("file"), (req, res) => {
    try {
        let { name, description, type, value: linkValue, } = req.body;
        if (!name || !type) {
            return res.status(400).json({
                message: "Name and Type are required fields",
                status: "error",
            });
        }
        let finalValue = "";
        let linkThumbPath;
        if (type === "image" || type === "document") {
            if (!req.file) {
                return res.status(400).json({
                    message: "File is required when type is media",
                    status: "error",
                });
            }
            finalValue = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }
        else if (type === "link") {
            if (!linkValue) {
                return res.status(400).json({
                    message: "Value string is required when type is link",
                    status: "error",
                });
            }
            if (req.file) {
                linkThumbPath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
            }
            finalValue = linkValue;
        }
        else {
            return res.status(400).json({
                message: "Invalid type. Must be 'link' or 'media'",
                status: "error",
            });
        }
        const newFeature = {
            id: Date.now().toString(),
            name,
            description,
            type: type,
            value: finalValue,
            linkThumbPath,
        };
        const currentFeatures = readFromFile(FEATURES_FILE, {
            count: 0,
            data: [],
        });
        const featuresList = currentFeatures.data;
        featuresList.push(newFeature);
        const updatedData = {
            count: featuresList.length,
            data: featuresList,
        };
        fs.writeFileSync(FEATURES_FILE, JSON.stringify(updatedData, null, 2), "utf8");
        res.status(201).json({
            message: "Feature added successfully",
            status: "success",
        });
    }
    catch (error) {
        console.error("DEBUG_SERVER_ERROR:", error);
        res
            .status(500)
            .json({ message: "Failed to save feature data", status: "error" });
    }
});
app.get("/api/company", (req, res) => {
    try {
        const query = req.query["searchKey"];
        let data = readFromFile(COMPANIES_FILE, {
            count: 0,
            data: [],
        });
        if (query) {
            data.data = data.data.filter((e) => e.companyName.toLowerCase().includes(query.toLowerCase()));
        }
        res.json({
            count: data.data.length,
            data: data.data,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read company data" });
    }
});
app.get("/api/job", (req, res) => {
    try {
        const { searchKey } = req.query;
        let data = readFromFile(JOBS_FILE, {
            count: 0,
            data: [],
        });
        if (searchKey) {
            data.data = data.data.filter((e) => e.title.toLowerCase().includes(searchKey.toLowerCase()) ||
                e.location
                    .toLowerCase()
                    .includes(searchKey.toLowerCase()));
        }
        res.json({
            count: data.data.length,
            data: data.data,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read job data" });
    }
});
app.get("/api/people", (req, res) => {
    try {
        const { searchKey } = req.query;
        let data = readFromFile(PEOPLE_FILE, {
            count: 0,
            data: [],
        });
        if (searchKey) {
            data.data = data.data.filter((e) => e.firstName
                .toLowerCase()
                .includes(searchKey.toLowerCase()) ||
                e.lastName
                    .toLowerCase()
                    .includes(searchKey.toLowerCase()) ||
                (e.headline
                    ? e.headline
                        .toLowerCase()
                        .includes(searchKey.toLowerCase())
                    : true));
        }
        res.json({
            count: data.data.length,
            data: data.data
                .map((e) => {
                return {
                    ...e,
                    connectionRel: e.relationship.connected
                        ? 1
                        : e.relationship.hasConnectionInCommon
                            ? 2
                            : 3,
                };
            })
                .sort((a, b) => a.connectionRel - b.connectionRel),
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read people data" });
    }
});
app.get("/api/group", (req, res) => {
    try {
        const { searchKey } = req.query;
        let data = readFromFile(GROUPS_FILE, {
            count: 0,
            data: [],
        });
        if (searchKey) {
            data.data = data.data.filter((e) => e.groupName
                .toLowerCase()
                .includes(searchKey.toLowerCase()) ||
                e.description
                    .toLowerCase()
                    .includes(searchKey.toLowerCase()));
        }
        res.json({
            count: data.data.length,
            data: data.data,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read group data" });
    }
});
app.get("/api/education-institution", (req, res) => {
    try {
        const { searchKey } = req.query;
        let data = readFromFile(INSTITUTIONS_FILE, {
            count: 0,
            data: [],
        });
        if (searchKey) {
            data.data = data.data.filter((e) => e.educationName
                .toLowerCase()
                .includes(searchKey.toLowerCase()));
        }
        res.json({
            count: data.data.length,
            data: data.data,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to read group data" });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
