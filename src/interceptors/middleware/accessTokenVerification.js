import Config from '../../configurations/configurations.js';
import logger from '../../utils/winston-logger.js';
import User from '../../common-helpers/parent-user-processor.js';
import jwt from 'jsonwebtoken';
const user = new User()

export default async (request, response, next) => {
    try {
        const accessToken = request.headers['accesstoken']
        if(!accessToken) return response.status(404).send({ code: "accesstoken required in headers" })
        await jwt.verify(accessToken, Config.jwt.secret);
        const accessTokenDecoded = await jwt.decode(accessToken);
        const userData = await user.getByuId(accessTokenDecoded.uid );
        if (!userData) return response.status(404).send({ code: "Invalid-Access-Token" })
        next();
    } catch (error) {
        logger.error(`-- error in verifyAccessToken in access token service: ` + error.stack)
        switch (error.message) {
            case 'invalid token':
            case 'jwt expired':
            case 'jwt malformed':
            case 'jwt not active':
            case 'jwt signature is required':
            case 'invalid signature':
            case 'invalid algorithm':
                logger.error(error.message);
                return response.status(404).send({ code: "Invalid-Access-Token" } )
            default:
                return response.status(500).send({ code: "Invalid-Access-Token" } )
        }
    }
}
