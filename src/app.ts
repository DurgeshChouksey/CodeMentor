import express from 'express';
import mainRouter from './routes/v1/index.js'
import { errorHandler } from './middlewares/middleware.errorHandler.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))


// routes
app.use('/api/v1', mainRouter);


// global error handler
app.use(errorHandler);


export default app;
