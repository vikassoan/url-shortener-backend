import express from 'express'

import { get_all_user_urls } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router();

router.get("/urls", authMiddleware, get_all_user_urls)
export default router;