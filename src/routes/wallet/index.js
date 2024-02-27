import express from 'express';
import { listWalletTransactions } from './get';
const walletRouter = express.Router();

walletRouter.get('/list', listWalletTransactions);


export default walletRouter;