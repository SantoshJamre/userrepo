import { userMongo } from '../database/mongo/mongo-user.js';
import logger from '../utils/winston-logger.js';

export default class {

    constructor() {
        this.user = new userMongo();
    }

    async getByMobile(phoneNumber) {
        return this.user.find({ phoneNumber });
    }

    async getByQuery(query) {
        return this.user.find(query);
    }

    async getByEmail(email) {
        return this.user.find({ email });
    }

    async createUser(userData = {}) {
        const dbResult = await this.user.createUser(userData);
        logger.info(`ParentUser created successfully in the DB`)
        return dbResult;
    }

    async LoginByMobileOrEmailAndPassword(mobileOrEmail, password) { // TODO: need to conform as sending more inormation in error.
        const userDetails = await this.user.find({...mobileOrEmail});
        if (!userDetails) return  userDetails ;
        if (!userDetails.passwordSalt || !userDetails.passwordHash) return { code: "incorrect-password" }
        const verifyPasswordDetails = {
            uid: userDetails._id, phoneNumber: userDetails.phoneNumber, email: userDetails.email,
            address:userDetails.address, name:userDetails.name,
            passwordHash: userDetails.passwordHash, passwordSalt: userDetails.passwordSalt, password
        }
        const verifyPasswordResponse = await this.verifyPassword(verifyPasswordDetails);
        if (!verifyPasswordResponse) {
            return { code: "incorrect-password" }
        }
        delete userDetails.passwordHash;
        delete userDetails.passwordSalt;
        return  userDetails ;

    }

   

    async verifyPassword(verifyPasswordDetails) {
        return await this.user.verifyPassword(verifyPasswordDetails)
    }

    async getByuId(uid) {
        return this.user.findByID(uid);
    }


    async updateData(uid, data, isPassword = false) {
        return this.user.update(uid , data, isPassword);
    }

}
