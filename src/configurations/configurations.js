

const configuration = {
  dbURL:"mongodb://127.0.0.1:27017/UserDB",
  Mailer: {
    credential: {
      host: '',
      port: 587,
      secure: false, 
      auth: {
        user: '', 
        pass: ''
      },
      tls: {
        secureProtocol: "TLSv1_method"
      },

    },
    fromName: '',
    fromEmail: ''
  },
 

  
  jwt: {
    secret: "b6QBvxXz4LRQ3PXXDQuYlICO1dswewee",
    issuer: "test",
    accessTokenExpiresIn: "10 days",
    refreshTokenExpiresIn: "30 days"
  },


};
export default configuration;
