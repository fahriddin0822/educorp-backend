import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import { setupDatabase } from "./setup.js";
import dotenv from "dotenv";
import { log } from "console";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Prepare allowed frontend URLs
const allowedOrigins = (process.env.FRONTEND_URLS || "http://localhost:5173,http://localhost:5174,https://educorp-front.vercel.app,https://educorp-front-ub5g.vercel.app")
  .split(",")
  .map(origin => origin.trim().replace(/\/$/, "")); // Remove trailing slashes

// Enable CORS for multiple allowed frontend URLs
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      console.log(`${new Date().toLocaleTimeString()} [backend] ${logLine}`);
    }
  });

  next();
});

(async () => {
  await setupDatabase();
  await registerRoutes(app);

  // Error-handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`${new Date().toLocaleTimeString()} [backend] Server running on port ${PORT}`);
  });
})();
