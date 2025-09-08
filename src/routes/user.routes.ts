import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getUser, toggleSharingStatus } from "../controllers/user.controller";

const router = Router();

router.use(authenticate); // protect all routes

router.get("/", getUser);
router.put("/status", toggleSharingStatus);
export default router;
