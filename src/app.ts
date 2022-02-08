import { NodeJsRestApiStarter} from './core/starter';
import emptyRoutes from './routes/empty';
import exampleRoutes from './routes/example';

const server = new NodeJsRestApiStarter();
server.enableNodemailer({from: "My Company Name"});
server.addRoutes([
    {router: exampleRoutes, path: '/dummy'},
    {router: emptyRoutes}
])