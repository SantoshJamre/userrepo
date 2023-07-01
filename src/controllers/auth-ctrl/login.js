import { AuthService } from '../../service/index.js';
import logger from "../../utils/winston-logger.js";

export default async (request, response, next) => {
    const { value } = response.locals;
    try {
        const authService = new AuthService();
        const loginResposne = await authService.login(value);
        const { result, code } = loginResposne;
        if(code) return response.status(400).send({code})
        return response.status(200).send(result)
       
    } catch (error) {
        logger.error(`error in the login Controller:`, error);
        return response.status(500).send({ message: "internal server error" });
    }
};
