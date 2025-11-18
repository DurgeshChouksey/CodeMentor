import express from "express";
import authRouter from "./auth.routes.js"
import repoRouter from "./repo.routes.js"
const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        msg: "Hello world"
    })
})


router.use('/auth/github', authRouter);
router.use('/repos', repoRouter)


export default router;
