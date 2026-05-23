import express, { Request, Response } from "express";
import fs from "fs";
import cors, { CorsOptions } from "cors";
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

const allowedOrigins = [
  "https://bi151103.github.io",
  "http://127.0.0.1:5500",
  "http://127.0.0.1:4200",
  "http://localhost:4200",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed to access."));
    }
  },
};

app.use(cors(corsOptions));

app.use(express.json());

type InfoData = {
  firstName: string;
  lastName: string;
  education: string;
  showEducation: boolean;
  industry: string;
  country: string;
  location: string;
};

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

type RecentSearchData = {
  count: number;
  data: string[];
};

const readFromFile = <T>(filePath: string, defaultValue: T): T => {
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  const rawData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(rawData) as T;
};

app.get("/api/user/info", (req: Request, res: Response) => {
  try {
    const data = readFromFile<InfoData>(INFO_FILE, {
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

app.post("/api/user/info", (req: Request<{}, {}, InfoData>, res: Response) => {
  try {
    const newData = req.body;
    fs.writeFileSync(INFO_FILE, JSON.stringify(newData, null, 2), "utf8");
    res.json({ message: "Update info successfully", data: newData });
  } catch (error) {
    res.status(500).json({ message: "Failed to save info data" });
  }
});

app.get("/api/connections", (req: Request, res: Response) => {
  try {
    const data = readFromFile<JsonValue[]>(CONNECTIONS_FILE, []);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to read connections" });
  }
});

app.get("/api/experiences", (req: Request, res: Response) => {
  try {
    const data = readFromFile<JsonValue[]>(EXPERIENCES_FILE, []);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to read experiences data" });
  }
});

app.post(
  "/api/experiences",
  (req: Request<{}, {}, JsonValue[]>, res: Response) => {
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
  },
);

app.get("/api/recent-search", (req: Request, res: Response) => {
  try {
    const data = readFromFile<RecentSearchData>(RECENT_SERCH_FILE, {
      count: 0,
      data: [],
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to read recent search data" });
  }
});

app.post(
  "/api/remove-recent-search",
  (req: Request<{}, {}, string[]>, res: Response) => {
    try {
      const itemDeletedList = req.body;
      const current = readFromFile<RecentSearchData>(RECENT_SERCH_FILE, {
        count: 0,
        data: [],
      });
      const data = current.data.filter(
        (item) => !itemDeletedList.includes(item),
      );
      const newData: RecentSearchData = {
        count: data.length,
        data,
      };

      fs.writeFileSync(
        RECENT_SERCH_FILE,
        JSON.stringify(newData, null, 2),
        "utf8",
      );

      res.json({ message: "Update recent search successfully", data: newData });
    } catch (error) {
      res.status(500).json({ message: "Failed to save experiences data" });
    }
  },
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
