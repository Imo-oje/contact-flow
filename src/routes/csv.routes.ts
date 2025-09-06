import { Router } from "express";
import { csvDownload } from "../controllers/csv.controller";
import { authenticate } from "../middleware/auth";
import { USER_ID } from "../constants/env";
import { bypassAuth } from "../dev/bypassAuth";

const router = Router();

router.use(USER_ID ? bypassAuth : authenticate);

router.get("/download", csvDownload);

export default router;
