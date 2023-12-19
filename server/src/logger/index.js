/** console logger mode */
function CSInterface(){

}

CSInterface.prototype.exec = function(level, eventName, message){
    const d = new Date();
    console.log(`[${level}][${eventName}][${d.toLocaleDateString('zh-TW')}-${d.toLocaleTimeString('zh-TW', {hour12: false})}]:${message}`);
}

/** 日誌 logger */
function Logger(interface){
    this.interface = interface
}

Logger.prototype.add = function(level, event, message){
    this.interface.exec(level, event, message);
}


module.exports = {
    Logger,CSInterface
}
