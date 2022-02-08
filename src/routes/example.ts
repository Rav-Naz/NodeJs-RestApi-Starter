import express from 'express';
import { Success } from '../responses/success';
import { NodeJsRestApiStarter } from '../core/starter';

const router = express.Router();
const appInstance = ((router as any).NodeJsRestApi as NodeJsRestApiStarter);

router.get('/example', (req, res, next) => {
    
    Success.OK(res, {
        example: "Hello world"
    })
})


export default router;