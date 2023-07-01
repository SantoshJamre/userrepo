import loginHandler from './auth-ctrl/login.js';
import signUpHandler from './auth-ctrl/sign-up.js';
import forgotPasswordHandler from './auth-ctrl/forgot-password.js';
import resetPassowrdHandler from './auth-ctrl/reset-password.js';
import updateProfileHandler from './auth-ctrl/update-profile.js';
import friendListHandler from './auth-ctrl/friend-list.js';
import friendRequestHandler from './auth-ctrl/friend-request.js';
import fetchProfileHandler from './auth-ctrl/fetch-profile.js';
import searchFriendHandler from './auth-ctrl/search-friend.js';


const AuthControler = {
    loginHandler,
    signUpHandler,
    forgotPasswordHandler,
    resetPassowrdHandler,
    updateProfileHandler,
    friendListHandler,
    friendRequestHandler,
    fetchProfileHandler,
    searchFriendHandler
}

export  {
    AuthControler
}


