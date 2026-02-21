import express from 'express';
import analyticsRouter from './routes/analytics.route';

const app = express();

app.use(express.json());
app.use('/analytics', analyticsRouter);

app.get('/', (req, res) => {
  res.send('API working correctly');
});


export default app;