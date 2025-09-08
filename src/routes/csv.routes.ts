import { Router } from "express";
import { csvDownload, getCsv } from "../controllers/csv.controller";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", getCsv);
// router.get("/latest", getLatest);
router.get("/download/:fileId", csvDownload);

export default router;
