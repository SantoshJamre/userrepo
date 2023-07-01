import { Router } from 'express';
import { loginValidator, signUpValidator, forgotPassowrdValidator, resetPassowrdValidator, updateProfileValidator, friendRequestValidator, searchFriendValidator } from '../interceptors/auth-app-schema-validations/auth-request-params-validators.js';
import accessTokenVerification from '../interceptors/middleware/accessTokenVerification.js'
import { AuthControler } from '../controllers/index.js';

const AuthRouter = Router();

AuthRouter.post("/sign-up", signUpValidator, AuthControler.signUpHandler);
AuthRouter.post("/login", loginValidator, AuthControler.loginHandler);

AuthRouter.post('/forgot-password', forgotPassowrdValidator, AuthControler.forgotPasswordHandler);
AuthRouter.post('/reset-password', resetPassowrdValidator, AuthControler.resetPassowrdHandler);


AuthRouter.use(accessTokenVerification)
AuthRouter.put('/update-profile/:uid', updateProfileValidator, AuthControler.updateProfileHandler);
AuthRouter.get('/friend-list/:uid', AuthControler.friendListHandler);
AuthRouter.put('/friend-request/:uid', friendRequestValidator, AuthControler.friendRequestHandler);
AuthRouter.get('/fetch-profile/:uid', AuthControler.fetchProfileHandler);

AuthRouter.post('/search-friend', searchFriendValidator, AuthControler.searchFriendHandler);


export default AuthRouter;