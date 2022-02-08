import express, { RequestHandler, Router } from 'express';
import * as dotenv from 'dotenv';
import * as http from 'http';
import cors from 'cors';


import { Nodemailer, NodemailerParameters } from '../utils/nodemailer';
import { Database, DatabaseParameters } from '../utils/database';


export class NodeJsRestApiStarter {

    public instance = express();
    private hostname: string;
    public port: number;
    public server: http.Server;
    public nodemailer: Nodemailer | undefined;
    public database: Database | undefined;

    constructor(
            params:  MainParameters | undefined = {
                methods: ['GET', 'POST', 'PUT', 'UPDATE', 'DELETE'],
                additionalAllowedHeaders: undefined
            }
        ) 
    {
        /// MAIN CONFIG
        dotenv.config();
        this.hostname = process.env.SERVER_HOSTNAME || '127.0.0.1';
        this.instance.use(express.json());
        this.instance.use(express.urlencoded({extended: true}));
        const headers = ['Content-Type', 'x-requested-with', 'Authorization', 'Accept'];
        const corsOptions = {
            origin: true,
            optionsSuccessStatus: 200,
            methods: params.methods,
            allowedHeaders: params.additionalAllowedHeaders ? [ ...params.additionalAllowedHeaders, ...headers] : headers,
            maxAge: 86400
        };
        this.instance.use(cors(corsOptions));
        this.port = Number(process.env.SERVER_PORT) || 8080; 
        this.server = http.createServer(this.instance).listen(this.port, this.hostname, () => {
            console.log('\x1b[36m%s\x1b[0m', `\nServer running at http://${this.hostname}:${this.port}`);
        });
    }
    
    /// EMAIL CONFIG
    enableNodemailer(params: NodemailerParameters): void {
        if(this.nodemailer) throw new Error("Nodemailer is already enabled");
        this.instance.set('views', __dirname + '/views');
        this.instance.set('view engine', 'ejs');
        this.nodemailer = new Nodemailer(params);
    }

    /// DATABASE CONFIG
    enableDatabase(params: DatabaseParameters): void {
        this.database = new Database(params);
    }
    
    addRoutes(routes: Array<SingleRoute>) {
        routes.forEach((route) => {
            Object.assign(route.router, {NodeJsRestApi: this})
            if (route.middlewares && route.path) {
                this.instance.use(route.path,...route.middlewares, route.router);
            } else if (route.path) {
                this.instance.use(route.path, route.router);
            } else {
                this.instance.use(route.router);
            }
        });
    }
}

interface MainParameters {
    methods?: Array<'GET' |  'POST' |  'DELETE' |  'UPDATE' |  'PUT'>;
    additionalAllowedHeaders?: Array<string>; 
}

interface SingleRoute {
    router: Router;
    path?: string;
    middlewares?: Array<RequestHandler>;
}
