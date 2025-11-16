import express from 'express';
import mainRouter from './routes/v1/index.js'
import { errorHandler } from './middlewares/middleware.errorHandler.js';
import cookieParser from 'cookie-parser'


const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());


// routes
app.use('/api/v1', mainRouter);


// global error handler
app.use(errorHandler);


export default app;
