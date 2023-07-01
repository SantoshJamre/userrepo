import { AuthService } from '../../service/index.js';
import logger from "../../utils/winston-logger.js";

export default async (request, response, next) => {
    const { uid } = request.params;
    const { value } = response.locals;
    try {
        const authService = new AuthService();
        let friendList;
        if (value.action == "accept" || value.action ==  "request") {
            friendList = await authService.addFriend(uid, value);
        } else {
            friendList = await authService.removeFriend(uid, value);
        }
        const { result, code } = friendList;
        if(code) return response.status(400).send({code})
        return response.status(200).send(result)
       
    } catch (error) {
        logger.error(`error in the login Controller:`, error);
        return response.status(500).send({ message: "internal server error" });
    }
};