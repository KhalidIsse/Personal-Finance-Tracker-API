import "dotenv/config";

const required = (key) => {
  const v = process.env[key]?.trim();
  if (!v) throw new Error(`Missing required environment variable: ${key}`);
  return v;
};

const optional = (...keys) => {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
};

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

function buildProductionMongoUri() {
  const raw = required("MONGODB_URI_PRO");
  const user = optional("MONGODB_USERNAME");
  const pass = optional("MONGODB_PASSWORD");

  // Full connection string (with or without Atlas placeholders)
  if (raw.startsWith("mongodb")) {
    const needsUser = raw.includes("<username>") || raw.includes("<db_username>");
    const needsPassword = raw.includes("<password>") || raw.includes("<db_password>");
    if ((needsUser && !user) || (needsPassword && !pass)) {
      throw new Error("MONGODB_USERNAME and MONGODB_PASSWORD are required for this MONGODB_URI_PRO");
    }

    return raw
      .replace("<username>", encodeURIComponent(user ?? ""))
      .replace("<db_username>", encodeURIComponent(user ?? ""))
      .replace("<password>", encodeURIComponent(pass ?? ""))
      .replace("<db_password>", encodeURIComponent(pass ?? ""));
  }

  // Otherwise treat it as the cluster host
  if (!user || !pass) throw new Error("MONGODB_USERNAME and MONGODB_PASSWORD are required");
  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${raw}/finance_tracker?retryWrites=true&w=majority`;
}

function buildMongoUri() {
  // Local development connects directly to MongoDB Community Server.
  // Production connects to Atlas and never falls back to a local database.
  return isProduction ? buildProductionMongoUri() : required("MONGO_URI_DEV");
}

const clientUrlValue = process.env.CLIENT_URL || (isProduction ? required("CLIENT_URL") : "http://localhost:5173");

export const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 5000,
  mongoUri: buildMongoUri(),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrls: clientUrlValue.split(",").map((url) => url.trim()).filter(Boolean),
  apiUrl: process.env.RENDER_EXTERNAL_URL || process.env.API_URL || "http://localhost:5000",
  cloudinary: {
    // CLOUDINARY_* is the standard spelling. The CLAUDINARY_* aliases keep an
    // existing local .env working while you rename it.
    cloud_name: optional("CLOUDINARY_CLOUD_NAME", "CLAUDINARY_CLAUD_NAME"),
    api_key: optional("CLOUDINARY_API_KEY", "CLAUDINARY_API_KEY"),
    api_secret: optional("CLOUDINARY_API_SECRET", "CLAUDINARY_API_SECRET"),
  },
};
