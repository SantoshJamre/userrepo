import { AuthService } from '../../service/index.js';
import logger from "../../utils/winston-logger.js";

export default async (request, response, next) => {
    try {
        const { value } = response.locals;
        const authService = new AuthService();
        const signUpReposne = await authService.signUp(value);
        if(signUpReposne.code) return response.status(400).send(signUpReposne)
        return response.status(200).send(signUpReposne)
    } catch (error) {
        logger.error(`error in the signUp Controller:`, error);
        return response.status(500).send({ message: "internal server error" });
    }
}