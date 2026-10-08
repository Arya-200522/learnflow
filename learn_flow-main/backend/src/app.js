import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";

import {
  fileURLToPath,
} from "node:url";

import authRoutes from "./routes/authRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import adminApprovalRoutes from "./routes/adminApprovalRoutes.js";

import {
  errorHandler,
  notFound,
} from "./middleware/error.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,

    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use(
  cors({
    origin:
      process.env.CLIENT_URL,

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
    ],
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(cookieParser());

if (
  process.env.NODE_ENV !== "test"
) {
  app.use(morgan("dev"));
}

app.get(
  "/api/health",
  (req, res) => {
    return res.json({
      status: "ok",
    });
  },
);

app.use(
  "/api/auth",
  authRoutes,
);

app.use(
  "/api/catalog",
  catalogRoutes,
);

app.use(
  "/api/progress",
  progressRoutes,
);

app.use(
  "/api/bookmarks",
  bookmarkRoutes,
);

app.use(
  "/api/notes",
  noteRoutes,
);

app.use(
  "/api/admin",
  adminApprovalRoutes,
);

if (
  process.env.NODE_ENV ===
  "production"
) {
  const currentDirectory =
    path.dirname(
      fileURLToPath(
        import.meta.url,
      ),
    );

  const clientDist =
    path.resolve(
      currentDirectory,
      "../../frontend/dist",
    );

  app.use(
    express.static(clientDist),
  );

  app.get(
    "/*splat",
    (req, res) => {
      return res.sendFile(
        path.join(
          clientDist,
          "index.html",
        ),
      );
    },
  );
}

app.use(notFound);
app.use(errorHandler);

export default app;