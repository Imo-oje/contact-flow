import { Router } from "express";
import {
  addContact,
  getMyContacts,
  updateContact,
  deleteContact,
  exportPersonalContacts,
} from "../controllers/contacts.controller";
import { authenticate } from "../middleware/auth";
import { USER_ID } from "../constants/env";
import { bypassAuth } from "../dev/bypassAuth";

const router = Router();

router.use(USER_ID ? bypassAuth : authenticate); // protect all routes

router.post("/", addContact);
router.get("/", getMyContacts);
router.put("/:contactId", updateContact);
router.delete("/:contactId", deleteContact);

// Premium fetures
router.get("/export", exportPersonalContacts);

// Future updates
// router.get("/restore/:contactId", restoreContact);

export default router;
