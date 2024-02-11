import express from 'express';
import { authenticateUser } from '../../middleware/authorization';

const clientRouter = express.Router();

clientRouter.use(authenticateUser);

clientRouter.get('/list', listClient);

export default clientRouter;