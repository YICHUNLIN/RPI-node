
const { io } = require("socket.io-client");
const {Logger,CSInterface} = require('../logger');
const log = new Logger(new CSInterface());

function Client(options, onTrigger, onMessage){
    this.isHandShacking = false;
    this.socket = io(options.url, {
        reconnectionDelayMax: 10000,
    });

    // 處理連線 1 收到一個邀請
    this.socket.on("Invite", (...args) => {
	log.add("INFO", "WS_INVITE", "Recieve invite.")
        this.socket.emit("Join", { id: options.id, name: options.name, invite_code: args[0].invite_code, time: new Date() });
    });

    // 處理連線 2, 到這真正完成連線
    this.socket.on("Ack_Invite", (...args) => {
	log.add("INFO", "WS_INVITE", `ACK, Join ${options.url} successed`)
	this.isHandShacking = true;
    });

    // 當收到 trigger 指令時
    this.socket.on("__TRIGGER", (...args) => {
	if (this.isHandShacking){
		onTrigger(args, this);
	} else log.add("ERROR","WS-__TRIGGER","handShacking is not finished.")
    })

    // 當收到某個訊息時
    this.socket.on("__message", (...args) => {
	if (this.isHandShacking){
		onMessage(args, this);
	} else log.add("ERROR", "WS-__message","handShacking is not finished.")
    })
}

Client.prototype.sendMesage = function(content){
	
}


//const client = new Client({url: 'ws://plc.kmn.tw:9876', id, name})
module.exports = function(options){
	if (!options.url) throw new Error("url must be required");
	if (!options.id) throw new Error("id must be required");
	if (!options.name) throw new Error("name must be required");
	return new Client(options);
}
