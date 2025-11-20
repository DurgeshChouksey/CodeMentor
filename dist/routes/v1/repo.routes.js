import express from 'express';
import { authHandler } from '../../middlewares/middleware.authHandler.js';
import { downloadRepo, fetchRepos } from '../../controllers/repo.controller.js';
const router = express.Router();
router.get('/fetch', authHandler, fetchRepos);
router.post('/download', authHandler, downloadRepo);
export default router;
//# sourceMappingURL=repo.routes.js.map