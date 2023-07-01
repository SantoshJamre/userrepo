
import rTracer from 'cls-rtracer'
import Config from "../configurations/configurations.js";
import winston from 'winston';
import 'winston-daily-rotate-file';

const currentDataInIST = () => {
    return new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
}

const logStreamName = "API logs"

const getBasicLogFormat = (colorize = false) => {
    return winston.format.combine(
        winston.format.label({ label: `${rTracer.id()}` }),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
        winston.format.printf(info => {
            let iId = rTracer.id() ? rTracer.id() :"default";
            info.message = typeof info.message !== 'string' ? JSON.stringify(info.message) : info.message;
            let message = `${currentDataInIST()} | ${info.level ? info.level.toUpperCase() : "-"} | ${info.message}`;
            message = (info.metadata && info.metadata.stack ? message + ' ' + info.metadata.stack : message) + ` | ${iId} `;
            return colorize ? winston.format.colorize().colorize(info.level, message) : message;
        }))
}/* | ${info.level.toUpperCase()} */

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.label({ label: `PID_${rTracer.id()}` }),
                winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
                getBasicLogFormat(true),
            )
        })
    ]
});

logger.finished = () => null;




export default logger;


