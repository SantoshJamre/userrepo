// TODO: Need to optimise the code for the connection
import mongoose from 'mongoose';
import Config from '../configurations/configurations.js';
import logger from '../utils/winston-logger.js';

async function init() {
    mongoose.connect(Config.dbURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = mongoose.connection;
    logger.info("Loading MongoDB Settings ...");

    db.on("error", logger.error.bind(logger, "connection error:"));

    db.once("open", function callback() {
        logger.info("______________MongoDB : Database connection opened______________");
    });
    
}
init();
export default { mongoose }