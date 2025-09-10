import { Router } from "express";
import {
  addContact,
  getMyContacts,
  updateContact,
  deleteContact,
  exportPersonalContacts,
  reportContact,
} from "../controllers/contacts.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate); // protect all routes

router.post("/", addContact);
router.get("/", getMyContacts);
router.put("/:contactId", updateContact);
router.delete("/:contactId", deleteContact);
router.post("/report", reportContact);

// Premium fetures
router.get("/export", exportPersonalContacts);

// Future updates
// router.get("/restore/:contactId", restoreContact);

export default router;
