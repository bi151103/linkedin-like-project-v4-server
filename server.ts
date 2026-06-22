import express, { Request, Response } from "express";
import fs from "fs";
import cors, { CorsOptions } from "cors";
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
const LOCATIONS_FILE = path.join(__dirname, "locations.json");
const COUNTRIES_FILE = path.join(__dirname, "countries.json");
const INDUSTRIES_FILE = path.join(__dirname, "industries.json");

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

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed to access."));
    }
  },
};

app.use("/uploads", cors(corsOptions), express.static(UPLOADS_DIR));
app.use(cors(corsOptions));

app.use(express.json());

type UpdateResponse = {
  message: string;
  status: "error" | "success";
};

type UserInfo = {
  id: string;
  firstName: string;
  lastName: string;
  headline?: string;
  education?: Education;
  showEducation: boolean;
  industry: string;
  country: Country;
  location: Location;
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

type NotificationType = "message" | "network" | "notification";

type NotificationBase = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  from: string;
  createdAt: string;
  isRead: boolean;
};

type MessageNotification = NotificationBase & {
  type: "message";
};

type NetworkNotification = NotificationBase & {
  type: "network";
};

type GeneralNotification = NotificationBase & {
  type: "notification";
};

type NotificationData = {
  data: (MessageNotification | NetworkNotification | GeneralNotification)[];
};

type Education = {
  id: string;
  institution: Institution;
  major: string;
  degreeType?: "bachelor" | "master";
  duration: {
    start: string;
    end?: string;
  };
};

export interface About {
  data: string;
}

export type FeatureType = "link" | MediaType;

export type MediaType = "image" | "document";

export interface Feature {
  id: string;
  name?: string;
  description?: string;
  type: FeatureType;
  value: string; //path to file or link
  linkThumbPath?: string;
}

export interface CreateFeatureRequest {
  name: string;
  description?: string;
  type: "link" | MediaType;
  value?: string;
  file?: File | null;
}

export type Country = { id: string; name: string };
export type Location = string;

export type Industry =
  | "IT Service and IT Consulting"
  | "Software Development"
  | "Manufacturing";

export interface Company {
  companyId: string;
  companyName: string;
  companyLogoSrc?: string;
  companyIndustry: Industry;
  companyCountry: Country;
  companyLocation: Location;
}

export interface Job {
  id: string;
  company: Company;
  title: string;
  country: Country;
  datePost: string;
  location: Location;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  headline?: string;
  relationship: {
    connected: boolean; //true: 1st
    hasConnectionInCommon: boolean; //true: 2nd; false: 3rd
    connectedAt?: string;
  };
  country: Country;
  location: Location;
}

export interface Group {
  id: string;
  groupName: string;
  membersCount: number;
  description: string;
  groupThumbnailUrl?: string;
}

export interface Institution {
  id: string;
  educationName: string;
  educationLogoSrc?: string;
  country: Country;
  location: Location;
}

const readFromFile = <T>(filePath: string, defaultValue: T): T => {
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  const rawData = fs.readFileSync(filePath, "utf8");
  return JSON.parse(rawData) as T;
};

app.get("/api/user/info", (req: Request, res: Response) => {
  try {
    const data = readFromFile<UserInfo>(INFO_FILE, {
      id: "",
      firstName: "",
      lastName: "",
      showEducation: false,
      industry: "",
      country: {
        id: "",
        name: "",
      },
      location: "",
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to read info data" });
  }
});

app.post(
  "/api/user/info",
  (req: Request<{}, {}, UserInfo>, res: Response<UpdateResponse>) => {
    try {
      const newData = req.body;
      fs.writeFileSync(INFO_FILE, JSON.stringify(newData, null, 2), "utf8");
      res
        .status(200)
        .json({ message: "Update info successfully", status: "success" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to save info data", status: "error" });
    }
  },
);

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
  (req: Request<{}, {}, string[]>, res: Response<UpdateResponse>) => {
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

      res.status(200).json({
        message: "Update recent search successfully",
        status: "success",
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update recent search", status: "error" });
    }
  },
);

app.get("/api/about", (req: Request, res: Response) => {
  try {
    const data = readFromFile<About>(ABOUT_FILE, { data: "" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to read about data" });
  }
});

app.post(
  "/api/about",
  (req: Request<{}, {}, About>, res: Response<UpdateResponse>) => {
    try {
      const newData = req.body;
      fs.writeFileSync(ABOUT_FILE, JSON.stringify(newData, null, 2), "utf8");
      res
        .status(200)
        .json({ message: "Update about successfully", status: "success" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to save about data", status: "error" });
    }
  },
);

app.get("/api/notifications/messages", (req: Request, res: Response) => {
  try {
    const data = readFromFile<NotificationData>(NOTIFICATIONS_FILE, {
      data: [],
    });
    const items = data.data.filter(
      (item): item is MessageNotification => item.type === "message",
    );
    res.json({ count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ message: "Failed to read message notifications" });
  }
});

app.get("/api/notifications/network", (req: Request, res: Response) => {
  try {
    const data = readFromFile<NotificationData>(NOTIFICATIONS_FILE, {
      data: [],
    });
    const items = data.data.filter(
      (item): item is NetworkNotification => item.type === "network",
    );
    res.json({ count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ message: "Failed to read network notifications" });
  }
});

app.get("/api/notifications/general", (req: Request, res: Response) => {
  try {
    const data = readFromFile<NotificationData>(NOTIFICATIONS_FILE, {
      data: [],
    });
    const items = data.data.filter(
      (item): item is GeneralNotification => item.type === "notification",
    );
    res.json({ count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ message: "Failed to read notifications" });
  }
});

app.get("/api/educations", (req: Request, res: Response) => {
  try {
    const data = readFromFile<{ count: number; data: Education[] }>(
      EDUCATIONS_FILE,
      {
        count: 0,
        data: [],
      },
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to read educations data" });
  }
});

app.get("/api/features", (req: Request, res: Response) => {
  try {
    const data = readFromFile<{ count: number; data: Feature[] }>(
      FEATURES_FILE,
      {
        count: 0,
        data: [],
      },
    );
    const sortedFeatures = data.data.sort(
      (a, b) => parseInt(b.id) - parseInt(a.id),
    );
    res.json({
      count: data.count,
      data: sortedFeatures,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to read features data" });
  }
});

app.post(
  "/api/features",
  upload.single("file"),
  (req: Request, res: Response<UpdateResponse>) => {
    try {
      let {
        name,
        description,
        type,
        value: linkValue,
      } = req.body as CreateFeatureRequest;

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
      } else if (type === "link") {
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
      } else {
        return res.status(400).json({
          message: "Invalid type. Must be 'link' or 'media'",
          status: "error",
        });
      }

      const newFeature: Feature = {
        id: Date.now().toString(),
        name,
        description,
        type: type as FeatureType,
        value: finalValue,
        linkThumbPath,
      };

      const currentFeatures = readFromFile<{ count: number; data: Feature[] }>(
        FEATURES_FILE,
        {
          count: 0,
          data: [],
        },
      );
      const featuresList = currentFeatures.data;
      featuresList.push(newFeature);

      const updatedData = {
        count: featuresList.length,
        data: featuresList,
      };

      fs.writeFileSync(
        FEATURES_FILE,
        JSON.stringify(updatedData, null, 2),
        "utf8",
      );

      res.status(201).json({
        message: "Feature added successfully",
        status: "success",
      });
    } catch (error) {
      console.error("DEBUG_SERVER_ERROR:", error);
      res
        .status(500)
        .json({ message: "Failed to save feature data", status: "error" });
    }
  },
);

app.get("/api/companies", (req: Request, res: Response) => {
  try {
    const query = req.query["searchKey"] as string;
    addRecentSearch(query);
    let data = readFromFile<{ count: number; data: Company[] }>(
      COMPANIES_FILE,
      {
        count: 0,
        data: [],
      },
    );
    if (query) {
      data.data = data.data.filter((e) =>
        e.companyName.toLowerCase().includes(query.toLowerCase()),
      );
    }
    res.json({
      count: data.data.length,
      data: data.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to read company data" });
  }
});

app.get("/api/jobs", (req: Request, res: Response) => {
  try {
    const { searchKey } = req.query;
    addRecentSearch(searchKey as string);
    let data = readFromFile<{ count: number; data: Job[] }>(JOBS_FILE, {
      count: 0,
      data: [],
    });
    if (searchKey) {
      data.data = data.data.filter(
        (e) =>
          e.title.toLowerCase().includes((searchKey as string).toLowerCase()) ||
          e.location
            .toLowerCase()
            .includes((searchKey as string).toLowerCase()),
      );
    }
    res.json({
      count: data.data.length,
      data: data.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to read job data" });
  }
});

app.get("/api/people", (req: Request, res: Response) => {
  try {
    const { searchKey } = req.query;
    addRecentSearch(searchKey as string);
    let data = readFromFile<{ count: number; data: Person[] }>(PEOPLE_FILE, {
      count: 0,
      data: [],
    });
    if (searchKey) {
      data.data = data.data.filter(
        (e) =>
          `${e.firstName} ${e.lastName}`
            .toLowerCase()
            .includes((searchKey as string).toLowerCase()) ||
          (e.headline
            ? e.headline
                .toLowerCase()
                .includes((searchKey as string).toLowerCase())
            : true),
      );
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
  } catch (error) {
    res.status(500).json({ message: "Failed to read people data" });
  }
});

app.get("/api/groups", (req: Request, res: Response) => {
  try {
    const { searchKey } = req.query;
    addRecentSearch(searchKey as string);
    let data = readFromFile<{ count: number; data: Group[] }>(GROUPS_FILE, {
      count: 0,
      data: [],
    });
    if (searchKey) {
      data.data = data.data.filter(
        (e) =>
          e.groupName
            .toLowerCase()
            .includes((searchKey as string).toLowerCase()) ||
          e.description
            .toLowerCase()
            .includes((searchKey as string).toLowerCase()),
      );
    }
    res.json({
      count: data.data.length,
      data: data.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to read group data" });
  }
});

app.get("/api/education-institutions", (req: Request, res: Response) => {
  try {
    const { searchKey } = req.query;
    addRecentSearch(searchKey as string);
    let data = readFromFile<{ count: number; data: Institution[] }>(
      INSTITUTIONS_FILE,
      {
        count: 0,
        data: [],
      },
    );
    if (searchKey) {
      data.data = data.data.filter((e) =>
        e.educationName
          .toLowerCase()
          .includes((searchKey as string).toLowerCase()),
      );
    }
    res.json({
      count: data.data.length,
      data: data.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to read institution data" });
  }
});

app.get("/api/industries", (req: Request, res: Response) => {
  try {
    const { searchKey } = req.query;
    let data = readFromFile<Industry[]>(INDUSTRIES_FILE, []);
    if (searchKey) {
      data = data.filter((e) =>
        e.toLowerCase().includes((searchKey as string).toLowerCase()),
      );
    }
    res.json({ count: data.length, data });
  } catch (error) {
    res.status(500).json({ message: "Failed to read industry data" });
  }
});

app.get("/api/countries", (req: Request, res: Response) => {
  try {
    const { searchKey } = req.query;
    let data = readFromFile<Country[]>(COUNTRIES_FILE, []);
    if (searchKey) {
      data = data.filter((e) =>
        e.name.toLowerCase().includes((searchKey as string).toLowerCase()),
      );
    }
    res.json({ count: data.length, data });
  } catch (error) {
    res.status(500).json({ message: "Failed to read country data" });
  }
});

app.get("/api/countries/:id", (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const data = readFromFile<Country[]>(COUNTRIES_FILE, []);

    const countryData = data.find(
      (e) => e.id.toLowerCase() === (id as string).toLowerCase(),
    );

    if (!countryData) {
      res.status(404).json({ message: "Country not found" });
      return;
    }

    res.json(countryData);
  } catch (error) {
    res.status(500).json({ message: "Failed to read country data" });
  }
});

app.get("/api/countries/:id/locations", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { searchKey } = req.query;

    const data = readFromFile<
      {
        country: Country;
        location: Location[];
      }[]
    >(LOCATIONS_FILE, []);

    const countryData = data.find(
      (e) => e.country.id.toLowerCase() === (id as string).toLowerCase(),
    );

    if (!countryData) {
      return res.status(404).json({
        message: "Country not found",
      });
    }

    let location = countryData.location;

    if (searchKey) {
      location = location.filter((location) =>
        location.toLowerCase().includes((searchKey as string).toLowerCase()),
      );
    }

    return res.json({
      count: location.length,
      data: location,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to read location data",
    });
  }
});

function addRecentSearch(searchKey: string) {
  try {
    const current = readFromFile<RecentSearchData>(RECENT_SERCH_FILE, {
      count: 0,
      data: [],
    });
    if (
      !current.data.find((e) => e.toLowerCase() === searchKey.toLowerCase())
    ) {
      current.data = [searchKey, ...current.data];
      current.count++;
    }

    fs.writeFileSync(
      RECENT_SERCH_FILE,
      JSON.stringify(current, null, 2),
      "utf8",
    );
  } catch (error) {
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
