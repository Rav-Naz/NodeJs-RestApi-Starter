import { Transporter, createTransport } from 'nodemailer';
import hbs, { NodemailerExpressHandlebarsOptions } from 'nodemailer-express-handlebars';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

export class Nodemailer  {
    private transporter: Transporter;
    private sender: string;
    private viewsPath: string | undefined;

    constructor(params: NodemailerParameters) {
        this.transporter = createTransport({
            host: process.env.EMAIL_HOST,
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER, // generated ethereal user
                pass: process.env.EMAIL_USER_PASS // generated ethereal password
            },

        });

        this.sender = params.from;
        
        if(params.viewsPath) {
            
            this.viewsPath = params.viewsPath;
            var options: NodemailerExpressHandlebarsOptions = {
                viewEngine : {
                    extname: params.extnamme ? params.extnamme : '.hbs', // handlebars extension
                    layoutsDir: params.viewsPath, // location of handlebars templates
                    defaultLayout: 'template', // name of main template
                    partialsDir: params.viewsPath, // location of your subtemplates aka. header, footer etc
                },
                viewPath: params.viewsPath,
                extName: params.extnamme ? params.extnamme : '.hbs'
            };
    
            this.transporter.use('compile', hbs(options));
        }


        console.log('\x1b[33m%s\x1b[0m',`\nNodemailer succesfully created!`);
        console.log(`\r\tHost: ${process.env.EMAIL_HOST}
                     \r\tUser: ${params.from} <${process.env.EMAIL_USER}>`);
        if(params.viewsPath) {
            console.log(`\r\tView Path: ${params.viewsPath}
                         \r\tEmail template extension: ${params.extnamme ? params.extnamme : '.hbs'}`);
        }
    }

    getTransporter(): Transporter {
        if(!this.transporter) {
            throw new Error('Nodemailer is not initialized');
        }
        return this.transporter;
    }

    sendEmail(params: EmailParameters) {
        if (!params.to && !params.cc && !params.bcc) throw Error("No recipients provided");
        return new Promise<void>(async (resolve, reject) => {

            var options;
            if('text' in params.type) {
               var content = params.type.text;
               options = (email: string) => {
                    return {
                        from: `${this.sender} <${process.env.EMAIL_FROM_ADDR}>`,
                        to: email,
                        subject: params.subject,
                        text: content
                    };
                  };
            } else if ('template' in params.type) {
                var locals = params.type.locals;
                const emailTemplatePath = process.env.EMAIL_VIEWS_PATH + params.type.template;
                console.log(emailTemplatePath);
                var emailTemplate = Handlebars.compile(fs.readFileSync(path.resolve(emailTemplatePath), 'utf8'));
                options = (email: string) => {
                    return {
                        from: `${this.sender} <${process.env.EMAIL_FROM_ADDR}>`,
                        to: email,
                        subject: params.subject,
                        html: emailTemplate(locals)
                    };
                  };
            } else {
                reject("Bad email type");
                return;
            }

            var recipients = params.to ? params.to : params.cc ? params.cc : params.bcc ? params.bcc : "";
            if(recipients === "") {
                reject("No recipients provided");
                return;
            }
            const result = await this.getTransporter().sendMail(options(recipients)).catch(() => {
                reject("Sending email error");
            });
            console.log('\x1b[33m%s\x1b[0m',`\nEmail has sended!`);
            console.log(`\r\tTo: ${params.to}
                         \r\tSubject: ${params.subject}
                         \r\tType: ${JSON.stringify(params.type)}
                         `);
            resolve();
        });
    }
}

export interface NodemailerParameters {
    from: string;
    viewsPath?: string;
    extnamme?: string;
}

export interface EmailParameters {
    to?: string;
    cc?: string;
    bcc?: string;
    subject: string;
    type: EmailText | EmailHtml
}

export interface EmailText {
    text: string;
}

export interface EmailHtml {
    template: string;
    locals?: object;
}