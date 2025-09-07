import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { compileContacts } from "../controllers/admin.controller";

const router = Router();

router.use(authenticate); // protect all routes
router.get("/compile", compileContacts);

export default router;
