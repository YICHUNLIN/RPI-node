
const CustomStrategy = require('passport-custom').Strategy;
const CryptoJS = require('crypto-js');
const objectServer = require('./ObjectServer')({
    clientId: process.env.selfAuthServer_clientId, 
    secret: process.env.selfAuthServer_secret,
    url: process.env.auth_server,
    selfAuthServerUserAccount: process.env.selfAuthServerUserAccount,
    selfAuthServerUserPassword: process.env.selfAuthServerUserPassword

})
module.exports = (passport, jarvis) => {
    passport.use('ticket_auth', new CustomStrategy((req, callback) => {
        if(!req.headers.hasOwnProperty('authorization')) return callback(null, false);
        if (!req.headers['authorization'].includes('Bearer')) return callback(null, false);
        // call api
        const ticket = req.headers.authorization.replace('Bearer ', '');
        objectServer.verifyTicket(ticket)
            .then(result => {
                req.loginState = result;
                req.ticket = ticket
                callback(null, result)
            })
            .catch(err => {
                console.log(err)
                callback(null, false)
            })
    }))
};
