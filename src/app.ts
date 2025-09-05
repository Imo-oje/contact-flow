import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import contactsRoutes from "./routes/contacts.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import csvRoutes from "./routes/csv.routes";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { APP_ORIGIN } from "./constants/env";
import { errorHandler } from "./middleware/error-handler";

const app = express();

const corsOptions = {
  origin: APP_ORIGIN,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(morgan("dev"));

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/contacts", contactsRoutes);
app.use("/user", userRoutes);
app.use("/csv", csvRoutes);

app.use(errorHandler);

export default app;
