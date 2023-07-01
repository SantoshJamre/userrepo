import express from 'express';
import rTracer from 'cls-rtracer'

import AuthRoutes from './routes/auth-routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rTracer.expressMiddleware());

app.use('/v1', AuthRoutes);

app.use('*', (req, res) => {
    res.status(404).send("Service Not Found.");
});
export default app;
