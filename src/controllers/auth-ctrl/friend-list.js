import { AuthService } from '../../service/index.js';
import logger from "../../utils/winston-logger.js";

export default async (request, response, next) => {
    const { uid } = request.params;
    try {
        const authService = new AuthService();
        const friendList = await authService.friendList(uid);
        const { result, code } = friendList;
        if(code) return response.status(400).send({code})
        return response.status(200).send(result)
       
    } catch (error) {
        logger.error(`error in the login Controller:`, error);
        return response.status(500).send({ message: "internal server error" });
    }
};