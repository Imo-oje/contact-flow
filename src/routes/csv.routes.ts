import { Router } from "express";
import { csvDownload } from "../controllers/csv.controller";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/download", csvDownload);

export default router;
