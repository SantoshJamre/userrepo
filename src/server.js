import './connectors/mongo-con.js';
import app from './app.js';
import logger from './utils/winston-logger.js';

const PORT = process.env.PORT || '8000';
app.listen(PORT, () => {
    logger.info(`App listening on port ${PORT}!`);
});

