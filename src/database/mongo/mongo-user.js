import mongoose from 'mongoose';
import Utility from '../../utils/utility.js';
const utility = new Utility();
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        index: false,
        unique: false
    },
    email: {
        type: String,
        index: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        index: true,
        unique: true,
    },
    address: {
        type: String,
        index: false,
        unique: false,
    },
    latitude: {
        type: Number,
        index: false,
        unique: false,
    },
    longitude: {
        type: Number,
        index: false,
        unique: false,
    },
    passwordHash: String,
    passwordSalt: String,
    forgotPassword: {
        OTP: {
            type: String
        },
    },
    friendList: [
        {
            uid: {
                type: String
            },
            name: {
                type: String
            }
        }
    ],
    friendRequest: [
        {
            uid: {
                type: String
            }
        }
    ]
}, { versionKey: false });

UserSchema.index({ email: 1 }, { phoneNumber: 1 })
const userModel = mongoose.model('users', UserSchema);

class userMongo {

    async find(data) {
        let userData = await userModel.findOne(data);
        let result = null;
        if (userData) {
            result = userData.toObject();
            result = JSON.parse(JSON.stringify(result))
        }
        return result;
    }

    async findByID(uid) {
        try {
            let userData = await userModel.findById(uid);
            let result = null;
            if (userData) {
                result = userData.toObject();
                result = JSON.parse(JSON.stringify(result))
            }
            return result;
        } catch (error) {
            return false
        }
    }

    async update(uid, data, isPassword = false) {
        if (isPassword) await userModel.findByIdAndUpdate(uid, { $unset: { forgotPassword: 1 }, $set: data }, false);
        else await userModel.findByIdAndUpdate(uid, data, false);
        return true;
    }


    async createUser(userData) {
        const phoneNumber = userData.countryCode && userData.mobile ? `${userData.countryCode}${userData.mobile}` : undefined;
        const passwordDetails = userData.password ? await utility.generatPasswordeHash(userData.password) : '';
        let insertData = {
            phoneNumber,
            name:userData.name,
            email: userData.email,
            passwordHash: passwordDetails.hash,
            passwordSalt: passwordDetails.salt,
            address:userData.address,
        }

        insertData = JSON.parse(JSON.stringify(insertData));
        const data = await userModel.create(insertData);
        delete insertData.passwordHash; // Removing the passwordHash & passwordSalt as it is the sensitive data not require in resposne.
        delete insertData.passwordSalt;
        return insertData;
    }

    async getAuthToken(payLoad = {}) {
        return await utility.customsAuthTokens(payLoad)
    }

    async verifyPassword(verifyPasswordDetails) {
        if (verifyPasswordDetails.passwordHash && verifyPasswordDetails.passwordSalt) {
            const passwordDetails = await utility.generatPasswordeHash(verifyPasswordDetails.password, verifyPasswordDetails.passwordSalt);
            if (verifyPasswordDetails.passwordHash !== passwordDetails.hash) {
                return false
            }
            return true;
        }
        return false
    }

}

export { userMongo }
