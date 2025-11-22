import express from "express";
import { qstashValidator } from "../../middlewares/middleware.qstashValidator.js";
import { processRepo } from "../../controllers/worker.controller.js";

const router = express.Router();

router.post("/process", qstashValidator, processRepo);

export default router;
