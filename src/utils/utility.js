import Config from '../configurations/configurations.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import moment from "moment-timezone";
import logger from './winston-logger.js';
import { appendFileSync, existsSync, writeFileSync } from 'fs';


export default class {

    async getCurrentTimestampInSeconds() {
        const currentTimestamp = moment().valueOf()
        const currentTimeInString = moment(currentTimestamp).format('MMMM Do YYYY, h:mm:ss a')
        return { currentTimestamp, currentTimeInString };
    }

    async getRandomOTP(length = 4) {
        return String(Math.floor(1000 + Math.random() * 9000));
    }

    async randomString(length) {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        logger.info("new OTP:" + text + " has been generated")
        return text;
    }

    async randomPasswordString(length) {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        logger.info("new OTP:" + text + " has been generated")
        return text;
    }

    async getNestedValue(object, pathToProperty) {
        try {
            return eval(`object.${pathToProperty}`);
        } catch (error) {
            return null;
        }
    }

    async isValidDate(dateString) {
        // dateString = moment(dateString, "Y-M-D").format("Y-MM-DD");
        return moment(dateString).isValid();
    }


    async getDummyEmail(emailpart) {
        return emailpart + '@vkdummy.com';
    }

    async isDummyEmail(email) {
        return email.indexOf('@vkdummy.com') > -1;
    }

    
    async customsAuthTokens(payLoad = {}) {
        const access_token = jwt.sign(payLoad, Config.jwt.secret, { expiresIn: Config.jwt.accessTokenExpiresIn, issuer: Config.jwt.issuer });
        const refresh_token = jwt.sign(payLoad, Config.jwt.secret, { expiresIn: Config.jwt.refreshTokenExpiresIn, issuer: Config.jwt.issuer });
        const accessTokenDecoded = jwt.decode(access_token);
        
        return ({
            accessToken: access_token,
            refreshToken: refresh_token,
            expirationTime: accessTokenDecoded['exp']
        });
    }

    async generatPasswordeHash(password, salt = null) {
        try {
            if (!salt) salt = crypto.randomBytes(16);
            salt = salt.toString('base64');
            var hash = crypto.createHmac('sha512', salt); 
            hash.update(password);
            var value = hash.digest('hex');
            return {
                salt: salt,
                hash: value
            };

        } catch (error) {
            console.log(error)
            logger.error(` -- error in generatPasswordeHash in utility --`, error);
        }
    }

    async loginResposneFormater(loginResposne ={}) { //TODO: Same Function as in the Auth Service.
        loginResposne = JSON.parse(JSON.stringify(loginResposne))
        let countryCode = '';
        let mobile = '';
        if (loginResposne.phoneNumber) {
            countryCode = loginResposne.phoneNumber.slice(0, 3);
            mobile = loginResposne.phoneNumber.slice(-10);
        }

        const email = loginResposne.email || '';
        const data = {
            uid: loginResposne._id,
            name: loginResposne.name,
            countryCode: countryCode,
            address: loginResposne.address,
            email,
            mobile,
           
        };
        data.authToken = await this.customsAuthTokens({ uid: data.uid })
        console.log(data,loginResposne)
        return data;
    }

    async formatValidationErrors(errors) {
        let messageString = '';
        const error = {
            invalidCountryCode: 'countryCode must be in correct format e.g. +91',
            invalidMobile: 'Please provide a valid mobile.', //TODO: pull related regular expression here as well
            invalidOTP: 'Invalid OTP.',
            invalidPin: 'Invalid PIN.',
            invalidPinLength: 'pin length must be 4 digits long.',
            invalidEmail: 'Invalid email.',
            leastFavourites: 'Please select at least 5 favourites.',
            invalidProfileName: 'Invalid profile name.',
            invalidDOB: 'Please provide a valid dob.',
            invalidMobileLength: 'mobile length must be 10 digits long.',
            invalidDayFormat: 'Days must be in binary format for seven days.',
            invalidDateFormat: 'Please provide a valid date e.g. 31-01-2001.',
            invalidOtpPasswordPeers: 'Input must contain only one of [password, otp].',
            missingOtpPasswordPeers: 'Input must contain atleast one of [password, otp]'
        };
        errors.details.forEach(function (key) {
            if (key.message !== undefined && key.message !== '') {
                let fieldError;
                if (key.context && key.context.peers && key.context.peers.length) {
                    fieldError = `${key.context.peers.toString()}_${key.type}`;
                }
                if (key.context.key) {
                    fieldError = `${key.context.key}_${key.type}`;
                }
                // logger.info(key);
                const commaSeparator = ', ';
                switch (fieldError) {
                    case 'countryCode_string.regex.base':
                    case 'countryCode_string.pattern.base':
                        messageString += error.invalidCountryCode;
                        break;
                    case 'mobile_string.regex.base':
                    case 'mobile_string.pattern.base':
                        messageString += error.invalidMobile;
                        break;
                    case 'otp_string.regex.base':
                    case 'otp_string.pattern.base':
                        messageString += error.invalidOTP;
                        break;
                    case 'pin_string.regex.base':
                    case 'pin_string.pattern.base':
                        messageString += error.invalidPin;
                        break;
                    case 'newPin_string.regex.base':
                    case 'newPin_string.pattern.base':
                        messageString += error.invalidPin;
                        break;
                    case 'oldPin_string.regex.base':
                    case 'oldPin_string.pattern.base':
                        messageString += error.invalidPin;
                        break;
                    case 'mobileOrEmail_string.regex.base':
                    case 'mobileOrEmail_string.pattern.base':
                        messageString += error.invalidMobile;
                        break;
                    case 'mobileOrEmail_string.length':
                        messageString += error.invalidMobileLength;
                        break;
                    case 'mobile_string.length':
                        messageString += error.invalidMobileLength;
                        break;
                    case 'pin_string.length':
                        messageString += error.invalidPinLength;
                        break;
                    case 'mobileOrEmail_string.email':
                        messageString += error.invalidEmail;
                        break;
                    case 'characters_array.min':
                        messageString += error.leastFavourites;
                        break;
                    case 'name_string.regex.base':
                    case 'name_string.pattern.base':
                        messageString += error.invalidProfileName;
                        break;
                    case 'dob_date.min':
                    case 'dob_date.max':
                        messageString += error.invalidDOB;
                        break;
                    case 'days_string.regex.base':
                    case 'days_string.pattern.base':
                        messageString += error.invalidDayFormat;
                        break;
                    case 'startDate_string.regex.base':
                    case 'endDate_string.regex.base':
                    case 'startDate_string.pattern.base':
                    case 'endDate_string.pattern.base':
                        messageString += error.invalidDateFormat;
                        break;
                    case 'password,otp_object.xor':
                        messageString += error.invalidOtpPasswordPeers;
                        break;
                    case 'password,otp_object.missing':
                        messageString += error.missingOtpPasswordPeers;
                        break;
                    default:
                        messageString += key.message;
                        break;
                }
                messageString += commaSeparator;
            }
        });
        // remove last comma, quotation marks and whitespaces
        return (messageString.replace(/"/g, '')).replace(/,\s*$/, '');
    }

    async getUserAccountDefaults(recordSignUpDate = false) {
        const { currentTimestamp, currentTimeInString } = await this.getCurrentTimestampInSeconds()
        const today = new Date(currentTimestamp);
        const currentTimeStringUTC = today.toUTCString();
        const data = { // TODO: can remove some of the key as they have the same values
            metadata: {
               // creationTime: currentTimeStringUTC,
                creationTimeStamp: currentTimestamp,
                // createdDateOfUser: currentTimestamp,
               // createdAt: currentTimeInString,
               // updatedAt: currentTimeInString,
            },
            preferences: {
                language: "english",
            }
        };
        if (recordSignUpDate) data.metadata.explorestartdate = Math.floor(Date.now() / 1000); //Utility.getCurrentTimestampInSeconds()
        return data;
    }

    async getNestedValue(object, pathToProperty) {
        try {
            return eval(`object.${pathToProperty}`);
        } catch (error) {
            return null;
        }
    }

    async sortByDateField(profiles, dateField) {
        return profiles.sort((a, b) => moment(eval(`b.${dateField}`), 'MMMM Do YYYY, h:mm:ss a') - moment(eval(`a.${dateField}`), 'MMMM Do YYYY, h:mm:ss a'));
    }


    async versionCompare(v1, v2, options = null) { // TODO: Need to ask why we have this function
        const lexicographical = options && options.lexicographical,
            zeroExtend = options && options.zeroExtend;
        let v1parts = v1.split('.'),
            v2parts = v2.split('.');

        function isValidPart(x) {
            return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
        }

        if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
            return NaN;
        }

        if (zeroExtend) {
            while (v1parts.length < v2parts.length) v1parts.push('0');
            while (v2parts.length < v1parts.length) v2parts.push('0');
        }

        if (!lexicographical) {
            v1parts = v1parts.map(Number);
            v2parts = v2parts.map(Number);
        }

        for (let i = 0; i < v1parts.length; ++i) {
            if (v2parts.length === i) {
                return 1;
            }

            if (v1parts[i] === v2parts[i]) {
                continue;
            }
            if (v1parts[i] > v2parts[i]) {
                return 1;
            } else {
                return -1;
            }
        }

        if (v1parts.length !== v2parts.length) {
            return -1;
        }

        return 0;
    }

    async isNewConfigBuild(appVersion, platform, device) {
        if (!appVersion || !platform || !device) return false; // fails silently
        const platformType = platform.toLowerCase();
        const deviceType = device.toLowerCase();
        let versionToCompareAgainst = '1.0.0'; // VKIDS-4891
        const { android, iOS } = Config.Platforms;
        const { tv, phone, tablet } = Config.DeviceTypes;
        if ((platformType === android || platformType === iOS) && (deviceType === phone || deviceType === tablet)) versionToCompareAgainst = Config.NewConfigAppVersions.mobile.android;
        if (platformType === android && deviceType === tv) versionToCompareAgainst = Config.NewConfigAppVersions.tv.android; // TODO: have it able to check against x.x.x as well
        if (platformType === iOS && deviceType === tv) versionToCompareAgainst = Config.NewConfigAppVersions.tv.iOS;
        return appVersion ? this.versionCompare(appVersion, versionToCompareAgainst) >= 0 : false;
    }

    async logVitalHeaders(request) {
        try {
            const ip       = request.header('x-forwarded-for') || request.connection.remoteAddress;
            var cielntInfo = geoip.lookup(ip);

            if(cielntInfo && ip) {
                cielntInfo["ip-address"] = ip
                logger.info(`Request info : ${JSON.stringify(cielntInfo)}`);
            };
            return cielntInfo;
        } catch (error) {
            logger.error("Error in logVitalHeaders :", error);
            return false;
        }
    }

    async isMobile(mobileOrEmail) {
        const mobRegEx = /^\d+$/;
        return (typeof mobileOrEmail === 'string' && mobRegEx.test(mobileOrEmail.trim()));
    }

    async verifyPartnerCustomRefreshToken(token) {
        try {
            await jwt.verify(token, Config.partnerCustomTokenDetails.refreshTokensecret);
            return { decoded: jwt.decode(token) };
        } catch (error) {
            logger.error(error);
            switch (error.message) {
                case 'invalid token':
                case 'jwt expired':
                case 'jwt malformed':
                case 'jwt not active':
                case 'jwt signature is required':
                case 'invalid signature':
                    return { errorCode: "partner/Invalid-expired-Token" }
                default:
                    return { errorCode: error };
            }

        }

    }

    async ApiSuccessResponse(data, message = 'OK', code = 'api/success', httpcode = 200) {
        const responseData = typeof data === 'boolean' ? {} : data;
        const successResponse = {
            result: {
                ...responseData,
                status: {
                    code,
                    message
                }
            },
            httpcode
        }
        return { successResponse };
    }

    async APIErrorResponse(message = null, code = 'api/failed', httpcode = 500) {
        const status = {
            code,
            message
        }
        if (!message) {
            status.message = 'There was an error. Please try again.'
            logger.error(`APIError Resposne from Utility :: ${JSON.stringify(httpcode)}, ${JSON.stringify(status)}`)
        } else {
            logger.info(`APIError Resposne from Utility  :: ${JSON.stringify(httpcode)}, ${JSON.stringify(status)}`)
        }
        return { status, httpcode }
    }

    async contactUsResponseFormater(statusCode, messageObj) {
        const response = {
            statusCode: statusCode,
            body: {
                errorCode: messageObj.errorCode || "",
                errorMessage: messageObj.errorMessage || "",
            }
        }
        if (messageObj.result) {
            response.body.result = messageObj.result
        }
        return response
    }

    async partnerCustomsTokens(payLoad) {
        delete payLoad.iat;
        delete payLoad.exp;
        const access_token = jwt.sign(payLoad, Config.partnerCustomTokenDetails.accessTokensecret, { expiresIn: Config.partnerCustomTokenDetails.accessTokenExpiresIn });
        const refresh_token = jwt.sign(payLoad, Config.partnerCustomTokenDetails.refreshTokensecret, { expiresIn: Config.partnerCustomTokenDetails.refreshTokenExpiresIn });
        const accessTokenDecoded = jwt.decode(access_token);
        return ({
            accessToken: access_token,
            refreshToken: refresh_token,
            expirationTime: accessTokenDecoded['exp']
        });
    }

    async asyncAddFailedData(data, file) { // TODO: Need to confirm the function requirment
        try {
            await appendFileSync(file, data, "utf8");
            return true;
        } catch (error) {
            logger.error(error)
            return false;
        }
    }

    //TODO:: This function is only for storing  lastcapturedData from firestore and nextPage from Authentication ,after Migration it can remove 
    async AddlastCaptureDataOrNextToken(lastFetchData, type = "user") { // TODO: Need to confirm the function requirment
        try {
            if (type === "user")
                await appendFileSync("FirestoreLastCaptured.csv", lastFetchData, 'utf8');
            else await appendFileSync("AuthLastCaptured.csv", lastFetchData, 'utf8');
            return true;
        } catch (error) {
            logger.error(error)
            return false;
        }
    }

    async getSystemData(data, action) { // TODO: Need to confirm the function requirment
        data._system = { [action]: data.systemRequestSchema };
        delete data.systemRequestSchema;
        return data;
    }

    async getNestedValue(object, pathToProperty) { // TODO: We have 3 function of the same signature need to remove 
        try {
            return eval(`object.${pathToProperty}`);
        } catch (error) {
            return null;
        }
    }

    async addDataInFIle(filename, data) {
        let fName = `errorfiles/${moment().format("DD-MM-YYYY")}-${filename}`;
        try {
            if (!existsSync(fName)) {
                await writeFileSync(fName, `"userID", "Timestamp", "erro code", "error message" \n`)
            }
            await appendFileSync(`${fName}`, data, 'utf8');
            return true;
        } catch (error) {
            logger.error("-------------------------------- ", error)
            return false;
        }
    }

};
