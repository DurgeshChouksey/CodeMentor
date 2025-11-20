import express from 'express';
import { gitLogin, gitLogout, handleGitCallback } from '../../controllers/auth.controller.js';
const router = express.Router();
router.get('/login', gitLogin);
router.get('/callback', handleGitCallback);
router.get('/logout', gitLogout);
export default router;
//# sourceMappingURL=auth.routes.js.map