import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logOutHandler,
  verifyEmailHandler,
  sendPasswordResetEmailHandler,
  resetPasswordHandler,
} from "../controllers/auth.controller";

const router = Router();

router.post("/signup", registerHandler);
router.post("/login", loginHandler);
router.get("/refresh", refreshHandler);
router.get("/logout", logOutHandler);
router.get("/email/verify/:code", verifyEmailHandler);
router.get("/password/forgot", sendPasswordResetEmailHandler);
router.get("/password/reset", resetPasswordHandler);

export default router;
