import express from 'express';
import { ClientError } from '../responses/client_errors'
import { NodeJsRestApiStarter } from '../core/starter';

const router = express.Router();
const appInstance = ((router as any).NodeJsRestApi as NodeJsRestApiStarter);

router.get('*', (req, res, next) => {
    ClientError.misdirectedRequest(res,"Cannot reach the path");
})
router.post('*', (req, res, next) => {
    ClientError.misdirectedRequest(res, "Cannot reach the path");
})
router.delete('*', (req, res, next) => {
    ClientError.misdirectedRequest(res, "Cannot reach the path");
})
router.patch('*', (req, res, next) => {
    ClientError.misdirectedRequest(res, "Cannot reach the path");
})
router.put('*', (req, res, next) => {
    ClientError.misdirectedRequest(res, "Cannot reach the path");
})

export default router;