import logger from '../utils/winston-logger.js';
import User from '../common-helpers/parent-user-processor.js';
import Utility from '../utils/utility.js';
import MailService from '../helper/mailer.js';
import { forgotPasswordSubject, forgotPasswordEmail } from "../constant/template.js"

export default class {

    constructor() {
        this.User = new User();
        this.Utility = new Utility();
        this.MailService = new MailService();

    }

    async signUp(input) {
        try {
            const { mobile, countryCode, email, password, name, address, latitude, longitude } = input;
            const phoneNumber = countryCode + mobile;
            const userDetails = [this.User.getByEmail(email)]
            phoneNumber ? userDetails.push(this.User.getByMobile(phoneNumber)) : null;
            const [emailExist, mobileExist] = await Promise.all(userDetails);
            logger.info(` for the phoneNumber ${phoneNumber} mobileExist: ${JSON.stringify(mobileExist)} & email ${email} emailExist: ${JSON.stringify(emailExist)}`)
            if (mobileExist) return { code: "mobile-already-registered" };
            if (emailExist) return { code: "email-already-registered" };

            const userData = await this.User.createUser(JSON.parse(JSON.stringify({ mobile, countryCode, email, password, name, address, latitude, longitude })));
            const userRecords = await this.Utility.loginResposneFormater({ ...userData })

            return { result: userRecords }

        } catch (error) {
            logger.error(" -- error in Sign up Auth service -- ", error);
            throw error;
        }
    }

    async login(input) {
        let userDetails = null;
        try {
            let { mobileOrEmail, countryCode, password, viaMobile } = input;
            let userInputData = {};
            viaMobile ? userInputData.phoneNumber = `${countryCode}${mobileOrEmail}` : userInputData.email = `${mobileOrEmail}`;
            userDetails = await this.User.LoginByMobileOrEmailAndPassword({ ...userInputData }, password);
            if (!userDetails) return { code: 'user-not-found' };
            if (userDetails.code) return userDetails
            const result = await this.Utility.loginResposneFormater(userDetails)
            return { result };

        } catch (error) {
            logger.error(`  -- login error in servive -- `, error)
            throw error;
        }
    }

    async forgotPassword(input) {
        try {
            const { email } = input;
            const userDetails = await this.User.getByEmail(email);

            logger.info(`userDetails for user : ${JSON.stringify(userDetails)}`)
            if (!userDetails) return { code: 'user-not-found' }

            const OTP = await this.Utility.randomPasswordString(6);
            await this.User.updateData(userDetails._id, { forgotPassword: { OTP } });

            const emailSubject = forgotPasswordSubject;
            const emailBody = forgotPasswordEmail.replace('{OTP}', OTP);
            await this.MailService.send(email, emailSubject, emailBody);

            return { message: `mail has been sent to ${email}` };

        } catch (error) {
            logger.error(`-- forgotPassword error in account service -- ${error.stack} `)
            throw error;
        }
    }

    async resetPassword(input) {
        try {
            const { email, otp, newpassword } = input;
            const userDetails = await this.User.getByEmail(email);

            if (!userDetails) return { code: 'user-not-found' }

            if (!(userDetails.forgotPassword && userDetails.forgotPassword.OTP)) return { code: 'please generate otp' }

            if (userDetails.forgotPassword.OTP !== otp) {
                return { code: 'invalid otp' }
            }

            const passwordDetails = await this.Utility.generatPasswordeHash(newpassword)

            await this.User.updateData(userDetails._id, { passwordHash: passwordDetails.hash, passwordSalt: passwordDetails.salt, }, true);

            return { result: { message: `password has been reset` } };

        } catch (error) {
            logger.error(`-- forgotPassword error in account service -- ${error.stack} `)
            throw error;
        }
    }

    async updateProfile(uid, input) {
        try {
            const { mobile, countryCode, name, address, password, latitude, longitude } = input;
            const phoneNumber = mobile ? countryCode + mobile : undefined;
            const userDetails = await this.User.getByuId(uid)

            if (!userDetails) return { code: 'user-not-found' };

            if (phoneNumber) {
                const isExist = await this.User.getByMobile(phoneNumber)
                if (isExist) return { code: "mobile-already-registered" };
            }

            let updateData = {
                phoneNumber, name, address, latitude, longitude
            }

            if (password) {
                const passwordDetails = await this.Utility.generatPasswordeHash(password)
                updateData.passwordHash = passwordDetails.hash
                updateData.passwordSalt = passwordDetails.salt
            }

            await this.User.updateData(userDetails._id, JSON.parse(JSON.stringify(updateData)))

            return { message: "profile has been updated" }

        } catch (error) {
            logger.error(" -- error in Sign up Auth service -- " + error.stack);
            throw error;
        }
    }

    async friendList(uid) {
        try {
            const userDetails = await this.User.getByuId(uid)
            if (!userDetails) return { code: 'user-not-found' };

            return { result: { friendList: userDetails.friendList ?? [], friendRequest: userDetails.friendRequest ?? [] } }

        } catch (error) {
            logger.error(" -- error in Sign up Auth service -- " + error.stack);
            throw error;
        }
    }

    async addFriend(uid, value) {
        try {
            const { friendUid } = value
            const [userDetails, friendData] = await Promise.all([this.User.getByuId(uid), this.User.getByuId(friendUid)])
            if (!userDetails) return { code: 'user-not-found' };

            if (!friendData) return { code: 'friend-data not found' };
            if (userDetails.friendList && value.action == "accept") {
                let friendList = userDetails.friendList;
                const friendExist = userDetails.friendList.findIndex(element => {
                    return element.uid == friendUid
                });

                if (friendExist >= 0) {
                    return { code: 'friend already added' };
                }

                friendList.push({ uid: friendData._id, name: friendData.name })

                await this.User.updateData(uid, { friendList })

                return { result: { message: "friend has been added" } }
            }

            if (userDetails.friendRequest && value.action == "request") {
                const friendRequest = userDetails.friendRequest
                const friendExist = userDetails.friendRequest.findIndex(element => {
                    return element.uid == friendUid
                });

                if (friendExist >= 0) {
                    return { code: 'already requested' };
                }

                friendRequest.push({ uid: friendData._id, name: friendData.name })

                await this.User.updateData(uid, { friendRequest })

                return { result: { message: "friend request has been added" } }
            }

        } catch (error) {
            logger.error(" -- error in Sign up Auth service -- " + error.stack);
            throw error;
        }
    }

    async removeFriend(uid, input) {
        try {
            const { friendUid, action } = input
            const [userDetails, friendData] = await Promise.all([this.User.getByuId(uid), this.User.getByuId(friendUid)])

            if (!userDetails) return { code: 'user-not-found' };

            if (!friendData) return { code: 'friend-data not found' };

            if (userDetails.friendList && action == "remove") {
                const index = userDetails.friendList.findIndex(element => {
                    return element.uid === friendUid
                });

                if (index < 0) {
                    return { result: { message: 'Friend is not added' } };
                }

                userDetails.friendList.splice(index, 1)
                await this.User.updateData(uid, { friendList: userDetails.friendList })

                return { result: { code: "friend has been added" } }
            }

            if (userDetails.friendRequest && action == "reject") {
                const index = userDetails.friendRequest.findIndex(element => {
                    return element.uid === friendUid
                });
                if (index < 0) {
                    return { code: 'Request not found' }
                }

                userDetails.friendRequest.splice(index, 1)
                await this.User.updateData(uid, { friendRequest: userDetails.friendRequest })

                return { result: { message: "request has been rejected" } }
            }

            return { code: 'friend-data not found' };

        } catch (error) {
            logger.error(" -- error in Sign up Auth service -- " + error.stack);
            throw error;
        }
    }

    async fetchProfile(uid) {
        try {
            const userDetails = await this.User.getByuId(uid)
            if (!userDetails) return { code: 'user-not-found' };

            let result = await this.Utility.loginResposneFormater(userDetails)
            delete result.authToken
            return { result }

        } catch (error) {
            logger.error(" -- error in Sign up Auth service -- " + error.stack);
            throw error;
        }
    }

    async searchFriend(value) {
        try {
            const { uid, name, email, mobile, countryCode } = value
            const promise = [this.User.getByuId(uid)]
            if (email) promise.push(this.User.getByEmail(email))
            else if (mobile) promise.push(this.User.getByMobile(countryCode + mobile))
            else promise.push(this.User.getByQuery({ name }))

            const [userDetails, searchResult] = await Promise.all(promise)

            const searchResultList = [];

            if (userDetails.friendList) {
                const result = userDetails.friendList.find(element => {
                    return element.uid = searchResult._id
                });
                if (!result && searchResult._id != userDetails._id) {
                    searchResultList.push({
                        name: searchResult.name,
                        email: searchResult.email,
                        phoneNumber: searchResult.phoneNumber,
                    })
                }

            }
            return { result: { searchResultList } }

        } catch (error) {
            logger.error(" -- error in Sign up Auth service -- " + error.stack);
            throw error;
        }
    }

}