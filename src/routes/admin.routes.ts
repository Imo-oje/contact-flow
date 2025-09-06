import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { admin } from "../middleware/admin";

const router = Router();

router.use(authenticate, admin); // protect all routes

export default router;
