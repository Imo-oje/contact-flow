import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getUser } from "../controllers/user.controller";

const router = Router();

router.use(authenticate); // protect all routes

router.get("/", getUser);
export default router;
