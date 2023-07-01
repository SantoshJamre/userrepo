import Joi from 'joi';
import utility from '../../utils/utility.js';
import logger from '../../utils/winston-logger.js';
const Utility = new utility();

const loginValidator = async (request, response, next) => {
    try {
        const input = request.body;
        logger.info(`API URL:${JSON.stringify(request.protocol)}://${request.get('host')} ${request.originalUrl}`);
        const viaMobile = input.mobileOrEmail ? await Utility.isMobile(input.mobileOrEmail) : false;
        input.viaMobile = viaMobile;
        let schema = Joi.object({
            viaMobile,
            mobileOrEmail: Joi.when('viaMobile',
                {
                    is: true, then: Joi.string().trim().length(10).regex(/^[1-9][0-9]*$/).required(),
                    otherwise: Joi.string().trim().email({ minDomainSegments: 2 }).required()
                },
            ),
            countryCode: Joi.when('viaMobile',
                { is: true, then: Joi.string().length(3).regex(/^(\+\d{2})$/).required(), otherwise: Joi.any().optional() },
            ),
            password: Joi.string().min(6).max(15).required(),
    
        }).options({ abortEarly: false });
        const { error, value } = schema.validate(input);
        if (error) {
            return response.status(404).send({ message: error?.details?.[0]?.message });
        }
        response.locals.value = value;
        return next();
    } catch (error) {
        logger.info(error.stack)
        return response.status(500).send({ message: "internal server error" });
    }
}

const signUpValidator = async (request, response, next) => {
    try {
        const input = request.body;
        logger.info(`API URL:${JSON.stringify(request.protocol)}://${request.get('host')} ${request.originalUrl}`);
        if (input.mobile && !input.countryCode) input.countryCode = "+91"
        let schema = Joi.object({
            mobile: Joi.string().trim().length(10).regex(/^[1-9][0-9]*$/).optional(),
            countryCode: Joi.string().length(3).regex(/^(\+\d{2})$/).optional(),
            email:Joi.string().trim().email({ minDomainSegments: 2 }).required(),
            name: Joi.string(),
            address: Joi.string(),
            password: Joi.string().min(6).max(15).required(),
            latitude: Joi.number().optional(), 
            longitude:Joi.number().optional()
        }).options({ abortEarly: false });

        const { error, value } = schema.validate(input);
        if (error) {
            return response.status(404).send({ message: error?.details?.[0]?.message });
        }
        console.log(value)
        response.locals.value = value;
        return next();

    } catch (error) {
        logger.info(error.stack)
        return response.status(500).send({ message: "internal server error" });
    }
}



const forgotPassowrdValidator = async (request, response, next) => {
    try {
        const input = request.body;
        logger.info(`API URL:${JSON.stringify(request.protocol)}://${request.get('host')} ${request.originalUrl}`);
        let schema = Joi.object({
            email:Joi.string().trim().email({ minDomainSegments: 2 }).required(),
        }).options({ abortEarly: false });

        const { error, value } = schema.validate(input);
        if (error) {
            return response.status(404).send({ message: error?.details?.[0]?.message });
        }
        response.locals.value = value;
        return next();

    } catch (error) {
        logger.info(error.stack)
        return response.status(500).send({ message: "internal server error" });
    }
}

const resetPassowrdValidator  = async (request, response, next) => {
    try {
        const input = request.body;
        logger.info(`API URL:${JSON.stringify(request.protocol)}://${request.get('host')} ${request.originalUrl}`);
        let schema = Joi.object({
            email: Joi.string().trim().email({ minDomainSegments: 2 }).required(),
            otp: Joi.string().length(6).trim().required(),
            newpassword: Joi.string().min(6).max(15).required()
        }).options({ abortEarly: false });

        const { error, value } = schema.validate(input);
        if (error) {
            return response.status(404).send({ message: error?.details?.[0]?.message });
        }
        response.locals.value = value;
        return next();

    } catch (error) {
        logger.info(error.stack)
        return response.status(500).send({ message: "internal server error" });
    }
}

const updateProfileValidator = async (request, response, next) => {
    try {
        const input = request.body;
        logger.info(`API URL:${JSON.stringify(request.protocol)}://${request.get('host')} ${request.originalUrl}`);
        if (input.mobile && !input.countryCode) input.countryCode = "+91"
        let schema = Joi.object({
            mobile: Joi.string().trim().length(10).regex(/^[1-9][0-9]*$/).optional(),
            countryCode: Joi.string().length(3).regex(/^(\+\d{2})$/).optional(),
            password: Joi.string().min(6).max(15).required(),
            name: Joi.string().min(6).optional(),
            address: Joi.string().min(6).optional(),
            latitude: Joi.number().optional(), 
            longitude:Joi.number().optional()
        }).min(1).options({ abortEarly: false });

        const { error, value } = schema.validate(input);
        if (error) {
            return response.status(404).send({ message: error?.details?.[0]?.message });
        }
        response.locals.value = value;
        return next();

    } catch (error) {
        logger.info(error.stack)
        return response.status(500).send({ message: "internal server error" });
    }
}

const friendRequestValidator = async (request, response, next) => {
    try {
        const input = request.body;
        logger.info(`API URL:${JSON.stringify(request.protocol)}://${request.get('host')} ${request.originalUrl}`);
        if (input.mobile && !input.countryCode) input.countryCode = "+91"
        let schema = Joi.object({
            friendUid: Joi.string().required(),
            action: Joi.string().valid(...['accept','remove','reject', 'request']).required(),
        }).options({ abortEarly: false });

        const { error, value } = schema.validate(input);
        if (error) {
            return response.status(404).send({ message: error?.details?.[0]?.message });
        }
        response.locals.value = value;
        return next();

    } catch (error) {
        logger.info(error.stack)
        return response.status(500).send({ message: "internal server error" });
    }
}

const searchFriendValidator = async (request, response, next) => {
    try {
        const input = request.body;
        logger.info(`API URL:${JSON.stringify(request.protocol)}://${request.get('host')} ${request.originalUrl}`);
        if (input.mobile && !input.countryCode) input.countryCode = "+91"
        let schema = Joi.object({
            uid: Joi.string().required(),
            mobile: Joi.string().trim().length(10).regex(/^[1-9][0-9]*$/).optional(),
            countryCode: Joi.string().length(3).regex(/^(\+\d{2})$/).optional(),
            email:Joi.string().trim().email({ minDomainSegments: 2 }).optional(),
            name: Joi.string().min(6).optional(),
        }).xor("mobile","name","email").options({ abortEarly: false });

        const { error, value } = schema.validate(input);
        if (error) {
            return response.status(404).send({ message: error?.details?.[0]?.message });
        }
        response.locals.value = value;
        return next();

    } catch (error) {
        logger.info(error.stack)
        return response.status(500).send({ message: "internal server error" });
    }
}






export { loginValidator, signUpValidator, forgotPassowrdValidator, resetPassowrdValidator, updateProfileValidator, friendRequestValidator, searchFriendValidator}