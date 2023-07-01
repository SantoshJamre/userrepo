import { AuthService } from '../../service/index.js';
import logger from "../../utils/winston-logger.js";

export default async (request, response, next) => {
    try {
        const { value } = response.locals;
        const { uid } = request.params;
        const authService = new AuthService();
        const result = await authService.updateProfile(uid, value);
        if(result.code) return response.status(400).send(result)
        return response.status(200).send(result)
    } catch (error) {
        logger.error(`error in the signUp Controller:`, error);
        return response.status(500).send({ message: "internal server error" });
    }
}