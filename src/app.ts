import express from 'express';
import analyticsRouter from './routes/analytics.route';

const app = express();

app.use(express.json());
app.use('/analytics', analyticsRouter);

export default app;