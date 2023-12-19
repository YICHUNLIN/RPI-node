const CryptoJS = require('crypto-js');
var jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');
const axios = require('axios');
var expires = require('expires');


function ObjectServer(options){
    var words = CryptoJS.enc.Utf8.parse(`${options.clientId}:${options.secret}`);
    this.client_cert = CryptoJS.enc.Base64.stringify(words);
    this.account = options.selfAuthServerUserAccount;
    this.password = options.selfAuthServerUserPassword;
    this.url = options.url;
}


ObjectServer.prototype.verifyTicket = function(ticket){
    const config = {
        headers:{
            'Content-Type': 'application/json',
            'authorization': `Bearer ${ticket}`,
            'authorization-client': `Basic ${this.client_cert}`
          }
    }
    return new Promise((resolve, reject) => {
        axios.get(`${this.url}/api/v3/verify/tcheck?ticket=${ticket}`, config)
            .then(t => resolve(jwt.decode(ticket)))
            .catch(err => reject(err));
    });
}

ObjectServer.prototype.getSelfTicket = function(){
    const config = {
        headers:{
            'Content-Type': 'application/json',
            'authorization-client': `Basic ${this.client_cert}`
          }
    }
    return new Promise((resolve, reject) => {
        axios.get(`${this.url}/api/v3/auth/ticket?account=${this.account}&password=${CryptoJS.MD5(this.password).toString()}`, config)
            .then(t => resolve(t.data))
            .catch(err => reject(err));
    });
}

ObjectServer.prototype.getCompanies = function(ticket){
    const config = {
        headers:{
            'Content-Type': 'application/json',
            'authorization': `Bearer ${ticket}`,
            'authorization-client': `Basic ${this.client_cert}`
          }
    }
    return new Promise((resolve, reject) => {
        axios.get(`${this.url}/api/v3/cmp`, config)
            .then(t => resolve(t.data))
            .catch(err => reject(err));
    });
}

ObjectServer.prototype.getUsers = function(ticket){
    const config = {
        headers:{
            'Content-Type': 'application/json',
            'authorization': `Bearer ${ticket}`,
            'authorization-client': `Basic ${this.client_cert}`
          }
    }
    return new Promise((resolve, reject) => {
        axios.get(`${this.url}/api/v3/user`, config)
            .then(t => resolve(t.data))
            .catch(err => {
                console.log(err)
                reject(err);
            });
    });
}

ObjectServer.prototype.getUser = function(objectId) {
    const t_this = this;
    return new Promise((resolve, reject) => {
        t_this.getSelfTicket()
            .then(r => {
                const config = {
                    headers:{
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${r.ticket}`
                      }
                }
                axios.get(`${this.url}/api/v3/user/${objectId}`, config)
                .then(t => resolve(t.data.data))
                .catch(err => reject(err));
            })
            .catch(err => reject(err))
    })
}






module.exports = function(options){
    return new ObjectServer(options)
};
