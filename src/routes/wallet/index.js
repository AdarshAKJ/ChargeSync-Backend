import express from 'express';
import { listWalletTransactions } from './get';
import { onlyAdminAndClientWithRoles } from '../../middleware/onlyClientAndAdmin';
const walletRouter = express.Router();

walletRouter.get('/list', onlyAdminAndClientWithRoles(["ADMIN", "OPERATION"]), listWalletTransactions);


export default walletRouter;