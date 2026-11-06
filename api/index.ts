import express from 'express';
import { apiRouter } from '../src/apiRouter.js';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Support requests routed either with or without /api prefix in Vercel Serverless
app.use('/api', apiRouter);
app.use(apiRouter);

export default app;
