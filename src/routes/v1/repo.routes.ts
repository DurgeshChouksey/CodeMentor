import express from 'express';
import { authHandler } from '../../middlewares/middleware.authHandler.js';
import { downloadRepo, fetchRepos } from '../../controllers/repo.controller.js';
import { askRepo } from '../../controllers/askRepo.controller.js';


const router = express.Router();

router.get('/fetch', authHandler, fetchRepos);
router.post('/download', authHandler, downloadRepo);
router.post('/ask', authHandler, askRepo);

export default router;
