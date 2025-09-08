import { Router } from "express";
import { banContacts, compileContacts } from "../controllers/admin.controller";

const router = Router();

//router.use(authenticate); // protect all routes
router.get("/compile", compileContacts);
router.put("/ban/contact", banContacts);

export default router;
