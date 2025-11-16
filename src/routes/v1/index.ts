import express from "express";
import { BadRequestError } from "../../utils/erros.js";
import authRouter from "./auth.routes.js"

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        msg: "Hello world"
    })
})


router.use('/auth/github', authRouter);


export default router;
