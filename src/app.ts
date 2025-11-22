import express from 'express';
import mainRouter from './routes/v1/index.js'
import { errorHandler } from './middlewares/middleware.errorHandler.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express();

// middlewares
import bodyParser from "body-parser";

app.use(
  bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf; // 👈 Store raw buffer
    },
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://test-frontend-six-dun.vercel.app",
    ],
    credentials: true,
  })
);


// routes
app.use('/api/v1', mainRouter);


// global error handler
app.use(errorHandler);


export default app;
