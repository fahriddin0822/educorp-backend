import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import { setupDatabase } from "./setup.js";
import dotenv from "dotenv";
import { log } from "console";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Normalize FRONTEND_URL to remove trailing slash
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

// Enable CORS for frontend connection
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));

// Rest of the code remains unchanged
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