import mysql from 'mysql';

export class Database {

    pool: mysql.Pool;

    constructor(
        { connectionLimit, optional }: DatabaseParameters) {
            const options = {
                connectionLimit: connectionLimit,
                host: optional?.host ? optional?.host : process.env.DB_HOST, // default localhost
                user: optional?.user ? optional?.user : process.env.DB_USERNAME,
                password: optional?.password ? optional?.password : process.env.DB_PASSWORD,
                database: optional?.database ? optional?.database : process.env.DB_DATABASE_NAME
            }
            this.pool = mysql.createPool(options);
            console.log('\x1b[33m%s\x1b[0m',`\nDatabase connection succesfully created!`);
            console.log(`\r\tConnection limit: ${options.connectionLimit}
                     \r\tHost: ${options.host}
                     \r\tUser: ${options.user}
                     \r\tPassword: ${options.password}
                     \r\tDatabase: ${options.database}`);
    }
}

export interface DatabaseParameters {
    connectionLimit: number; optional?: {
        host?: string;
        user?: string;
        password?: string;
        database?: string;
    };
}