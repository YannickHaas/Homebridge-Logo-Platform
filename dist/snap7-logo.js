"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Snap7Logo = exports.LogoAddress = exports.WordLen = exports.Area = void 0;
let snap7 = require('napi-snap7');
const error_1 = require("./error");
var Area;
(function (Area) {
    Area[Area["S7AreaPE"] = 129] = "S7AreaPE";
    Area[Area["S7AreaPA"] = 130] = "S7AreaPA";
    Area[Area["S7AreaMK"] = 131] = "S7AreaMK";
    Area[Area["S7AreaDB"] = 132] = "S7AreaDB";
    Area[Area["S7AreaCT"] = 28] = "S7AreaCT";
    Area[Area["S7AreaTM"] = 29] = "S7AreaTM";
})(Area || (exports.Area = Area = {}));
var WordLen;
(function (WordLen) {
    WordLen[WordLen["S7WLBit"] = 1] = "S7WLBit";
    WordLen[WordLen["S7WLByte"] = 2] = "S7WLByte";
    WordLen[WordLen["S7WLChar"] = 3] = "S7WLChar";
    WordLen[WordLen["S7WLWord"] = 4] = "S7WLWord";
    WordLen[WordLen["S7WLInt"] = 5] = "S7WLInt";
    WordLen[WordLen["S7WLDWord"] = 6] = "S7WLDWord";
    WordLen[WordLen["S7WLDInt"] = 7] = "S7WLDInt";
    WordLen[WordLen["S7WLReal"] = 8] = "S7WLReal";
    WordLen[WordLen["S7WLCounter"] = 28] = "S7WLCounter";
    WordLen[WordLen["S7WLTimer"] = 29] = "S7WLTimer";
})(WordLen || (exports.WordLen = WordLen = {}));
class LogoAddress {
    addr;
    bit;
    wLen;
    constructor(addr, bit, wLen) {
        this.addr = addr;
        this.bit = bit;
        this.wLen = wLen;
    }
}
exports.LogoAddress = LogoAddress;
class Snap7Logo {
    type = "0BA7";
    ipAddr = "";
    local_TSAP = 0x2000;
    remote_TSAP = 0x2000;
    db = 1;
    debugMsgLog = 0;
    log;
    retryCnt;
    s7client;
    constructor(type, ipAddr, local_TSAP, remote_TSAP, debug, logFunction, retrys) {
        this.type = type;
        this.ipAddr = ipAddr;
        this.local_TSAP = local_TSAP;
        this.remote_TSAP = remote_TSAP;
        this.debugMsgLog = debug;
        this.log = logFunction;
        this.retryCnt = retrys;
        this.s7client = new snap7.S7Client();
        this.s7client.SetConnectionParams(this.ipAddr, this.local_TSAP, this.remote_TSAP);
    }
    ReadLogo(item, callBack) {
        this.ConnectS7(this.s7client, this.debugMsgLog, this.retryCnt, (success) => {
            if (success == false) {
                if (this.debugMsgLog == 1) {
                    this.log('ReadLogo() - Connection failed.');
                }
                callBack(error_1.ErrorNumber.noData);
                return error_1.ErrorNumber.noData;
            }
            var target = this.getAddressAndBit(item, this.type);
            this.DBReadS7(this.s7client, this.db, target, this.debugMsgLog, this.retryCnt, (success) => {
                if (success == error_1.ErrorNumber.noData) {
                    callBack(error_1.ErrorNumber.noData);
                }
                else {
                    if (success > error_1.ErrorNumber.maxPositivNumber) {
                        success = success - error_1.ErrorNumber.max16BitNumber;
                    }
                    callBack(success);
                }
            });
        });
    }
    WriteLogo(item, value) {
        this.ConnectS7(this.s7client, this.debugMsgLog, this.retryCnt, (success) => {
            if (success == false) {
                if (this.debugMsgLog == 1) {
                    this.log('WriteLogo() - Connection failed.');
                }
                return error_1.ErrorNumber.noData;
            }
            var target = this.getAddressAndBit(item, this.type);
            var buffer_on;
            if (target.wLen == WordLen.S7WLBit) {
                buffer_on = Buffer.from([value << target.bit]);
            }
            if (target.wLen == WordLen.S7WLByte) {
                buffer_on = Buffer.from([value]);
            }
            if (target.wLen == WordLen.S7WLWord) {
                buffer_on = Buffer.from([((value & 0b1111111100000000) >> 8), (value & 0b0000000011111111)]);
            }
            if (target.wLen == WordLen.S7WLDWord) {
                buffer_on = Buffer.from([((value & 0b11111111000000000000000000000000) >> 24), ((value & 0b00000000111111110000000000000000) >> 16), ((value & 0b00000000000000001111111100000000) >> 8), (value & 0b00000000000000000000000011111111)]);
            }
            this.DBWriteS7(this.s7client, this.db, target, this.debugMsgLog, this.retryCnt, buffer_on, (success) => {
                if (!success) {
                    return error_1.ErrorNumber.noData;
                }
            });
        });
    }
    ConnectS7(s7client, debugLog, retryCount, callBack) {
        if (retryCount == 0) {
            if (debugLog == 1) {
                this.log('ConnectS7() - Retry counter reached max value');
            }
            if (callBack) {
                callBack(false);
            }
            return false;
        }
        if (s7client.GetConnected() != true) {
            s7client.Disconnect();
            retryCount = retryCount - 1;
            let err = s7client.Connect();
            if (err == error_1.ErrorNumber.noConnection) {
                if ((debugLog == 1) && (retryCount == 1)) {
                    this.log('ConnectS7() - Connection failed. Retrying. Code #' + err + ' - ' + s7client.ErrorText(err));
                }
                if ((debugLog == 1) && (retryCount > 1)) {
                    this.log('ConnectS7() - Connection failed. Retrying. (%i)', retryCount);
                }
                s7client.Disconnect();
                sleep(100).then(() => {
                    this.ConnectS7(s7client, debugLog, retryCount, callBack);
                });
            }
            else {
                if (callBack) {
                    callBack(true);
                }
            }
        }
        else {
            if (callBack) {
                callBack(true);
            }
        }
        return true;
    }
    DisconnectS7() {
        if (this.s7client.GetConnected() == true) {
            this.s7client.Disconnect();
            if (this.debugMsgLog == 1) {
                this.log('DisconnectS7() - Disconnect LOGO!');
            }
        }
    }
    ReadAreaS7(s7client, db, target, debugLog, retryCount, callBack) {
        if (retryCount == 0) {
            if (debugLog == 1) {
                this.log('ReadS7() - Retry counter reached max value');
            }
            callBack(error_1.ErrorNumber.noData);
            return error_1.ErrorNumber.noData;
        }
        retryCount = retryCount - 1;
        //                         Area, DBNumber, Start,       Amount, WordLen
        s7client.ReadArea(Area.S7AreaDB, db, target.addr, 1, 0x02, (err, data) => {
            if (err) {
                if ((debugLog == 1) && (retryCount == 1)) {
                    this.log('ReadS7() - ReadArea failed. Code #' + err + ' - ' + this.s7client.ErrorText(err));
                }
                if ((debugLog == 1) && (retryCount > 1)) {
                    this.log('ReadS7() - ReadArea failed. Retrying. (%i)', retryCount);
                }
                sleep(100).then(() => {
                    this.ReadAreaS7(s7client, db, target, debugLog, retryCount, callBack);
                });
            }
            else {
                var buffer = Buffer.from(data);
                if (target.wLen == WordLen.S7WLBit) {
                    callBack((buffer[0] >> target.bit) & 1);
                }
                if (target.wLen == WordLen.S7WLByte) {
                    callBack(buffer[0]);
                }
                if (target.wLen == WordLen.S7WLWord) {
                    callBack((buffer[0] << 8) | buffer[1]);
                }
                if (target.wLen == WordLen.S7WLDWord) {
                    callBack((buffer[0] << 24) | (buffer[1] << 16) | (buffer[2] << 8) | buffer[3]);
                }
                callBack(error_1.ErrorNumber.noData);
            }
        });
    }
    DBReadS7(s7client, db, target, debugLog, retryCount, callBack) {
        if (retryCount == 0) {
            if (debugLog == 1) {
                this.log('ReadS7() - Retry counter reached max value');
            }
            callBack(error_1.ErrorNumber.noData);
            return error_1.ErrorNumber.noData;
        }
        retryCount = retryCount - 1;
        let leng = this.getWordSize(target.wLen);
        s7client.DBRead(db, target.addr, leng, (err, data) => {
            if (err) {
                if ((debugLog == 1) && (retryCount == 1)) {
                    this.log('ReadS7() - DBRead failed. Code #' + err + ' - ' + this.s7client.ErrorText(err));
                }
                if ((debugLog == 1) && (retryCount > 1)) {
                    this.log('ReadS7() - DBRead failed. Retrying. (%i)', retryCount);
                }
                sleep(100).then(() => {
                    this.DBReadS7(s7client, db, target, debugLog, retryCount, callBack);
                });
            }
            else {
                var buffer = Buffer.from(data);
                if (target.wLen == WordLen.S7WLBit) {
                    // this.log('Bit: ', (buffer[0] >> target.bit) & 1);
                    callBack((buffer[0] >> target.bit) & 1);
                }
                if (target.wLen == WordLen.S7WLByte) {
                    // this.log('Byte: ', buffer[0]);
                    callBack(buffer[0]);
                }
                if (target.wLen == WordLen.S7WLWord) {
                    // this.log('Word: ', (buffer[0] << 8) | buffer[1]);
                    callBack((buffer[0] << 8) | buffer[1]);
                }
                if (target.wLen == WordLen.S7WLDWord) {
                    // this.log('DWord: ', (buffer[0] << 24) | (buffer[1] << 16) | (buffer[2] << 8) | buffer[3]);
                    callBack((buffer[0] << 24) | (buffer[1] << 16) | (buffer[2] << 8) | buffer[3]);
                }
                // callBack(ErrorNumber.noData);
            }
        });
    }
    WriteAreaS7(s7client, db, target, debugLog, retryCount, buffer, callBack) {
        if (retryCount == 0) {
            if (debugLog == 1) {
                this.log('WriteS7() - Retry counter reached max value');
            }
            if (callBack) {
                callBack(false);
            }
            return error_1.ErrorNumber.noData;
        }
        retryCount = retryCount - 1;
        //                          Area, DBNumber, Start,       Amount, WordLen, Buffer
        s7client.WriteArea(Area.S7AreaDB, db, target.addr, 1, 0x02, buffer, (err) => {
            if (err) {
                if ((debugLog == 1) && (retryCount == 1)) {
                    this.log('WriteS7() - DBWrite failed. Code #' + err + ' - ' + s7client.ErrorText(err));
                }
                if ((debugLog == 1) && (retryCount > 1)) {
                    this.log('WriteS7() - DBWrite failed. Retrying. (%i)', retryCount);
                }
                sleep(100).then(() => {
                    this.WriteAreaS7(s7client, db, target, debugLog, retryCount, buffer, callBack);
                });
            }
            if (callBack) {
                callBack(true);
            }
        });
    }
    DBWriteS7(s7client, db, target, debugLog, retryCount, buffer, callBack) {
        if (retryCount == 0) {
            if (debugLog == 1) {
                this.log('WriteS7() - Retry counter reached max value');
            }
            if (callBack) {
                callBack(false);
            }
            return error_1.ErrorNumber.noData;
        }
        retryCount = retryCount - 1;
        let leng = this.getWordSize(target.wLen);
        s7client.DBWrite(db, target.addr, leng, buffer, (err) => {
            if (err) {
                if ((debugLog == 1) && (retryCount == 1)) {
                    this.log('WriteS7() - DBWrite failed. Code #' + err + ' - ' + s7client.ErrorText(err));
                }
                if ((debugLog == 1) && (retryCount > 1)) {
                    this.log('WriteS7() - DBWrite failed. Retrying. (%i)', retryCount);
                }
                sleep(100).then(() => {
                    this.DBWriteS7(s7client, db, target, debugLog, retryCount, buffer, callBack);
                });
            }
            if (callBack) {
                callBack(true);
            }
        });
    }
    getAddressAndBit(name, target_type) {
        if (name.match("AI[0-9]{1,2}")) {
            var num = parseInt(name.replace("AI", ""), 10);
            if (target_type == "0BA7") {
                return Snap7Logo.calculateWord(926, num);
            }
            else {
                return Snap7Logo.calculateWord(1032, num);
            }
        }
        if (name.match("AQ[0-9]{1,2}")) {
            var num = parseInt(name.replace("AQ", ""), 10);
            if (target_type == "0BA7") {
                return Snap7Logo.calculateWord(944, num);
            }
            else {
                return Snap7Logo.calculateWord(1072, num);
            }
        }
        if (name.match("AM[0-9]{1,2}")) {
            var num = parseInt(name.replace("AM", ""), 10);
            if (target_type == "0BA7") {
                return Snap7Logo.calculateWord(952, num);
            }
            else {
                return Snap7Logo.calculateWord(1118, num);
            }
        }
        if (name.match("I[0-9]{1,2}")) {
            var num = parseInt(name.replace("I", ""), 10);
            if (target_type == "0BA7") {
                return Snap7Logo.calculateBit(923, num);
            }
            else {
                return Snap7Logo.calculateBit(1024, num);
            }
        }
        if (name.match("Q[0-9]{1,2}")) {
            var num = parseInt(name.replace("Q", ""), 10);
            if (target_type == "0BA7") {
                return Snap7Logo.calculateBit(942, num);
            }
            else {
                return Snap7Logo.calculateBit(1064, num);
            }
        }
        if (name.match("M[0-9]{1,2}")) {
            var num = parseInt(name.replace("M", ""), 10);
            if (target_type == "0BA7") {
                return Snap7Logo.calculateBit(948, num);
            }
            else {
                return Snap7Logo.calculateBit(1104, num);
            }
        }
        if (name.match("V[0-9]{1,4}\.[0-7]{1}")) {
            var str = name.replace("V", "");
            var a = parseInt(str.split(".", 2)[0], 10);
            var b = parseInt(str.split(".", 2)[1], 10);
            return new LogoAddress(a, b, WordLen.S7WLBit);
        }
        if (name.match("VB[0-9]{1,4}")) {
            var num = parseInt(name.replace("VB", ""), 10);
            return new LogoAddress(num, 0, WordLen.S7WLByte);
        }
        if (name.match("VW[0-9]{1,4}")) {
            var num = parseInt(name.replace("VW", ""), 10);
            return new LogoAddress(num, 0, WordLen.S7WLWord);
        }
        if (name.match("VD[0-9]{1,4}")) {
            var num = parseInt(name.replace("VD", ""), 10);
            return new LogoAddress(num, 0, WordLen.S7WLDWord);
        }
        return new LogoAddress(0, 0, WordLen.S7WLBit);
    }
    isValidLogoAddress(name) {
        if (name.match("AI[0-9]{1,2}")) {
            return true;
        }
        if (name.match("AQ[0-9]{1,2}")) {
            return true;
        }
        if (name.match("AM[0-9]{1,2}")) {
            return true;
        }
        if (name.match("I[0-9]{1,2}")) {
            return true;
        }
        if (name.match("Q[0-9]{1,2}")) {
            return true;
        }
        if (name.match("M[0-9]{1,2}")) {
            return true;
        }
        if (name.match("V[0-9]{1,4}\.[0-7]{1}")) {
            return true;
        }
        if (name.match("VB[0-9]{1,4}")) {
            return true;
        }
        if (name.match("VW[0-9]{1,4}")) {
            return true;
        }
        if (name.match("VD[0-9]{1,4}")) {
            return true;
        }
        return false;
    }
    isAnalogLogoAddress(name) {
        if (name.match("AI[0-9]{1,2}")) {
            return true;
        }
        if (name.match("AQ[0-9]{1,2}")) {
            return true;
        }
        if (name.match("AM[0-9]{1,2}")) {
            return true;
        }
        if (name.match("I[0-9]{1,2}")) {
            return false;
        }
        if (name.match("Q[0-9]{1,2}")) {
            return false;
        }
        if (name.match("M[0-9]{1,2}")) {
            return false;
        }
        if (name.match("V[0-9]{1,4}\.[0-7]{1}")) {
            return false;
        }
        if (name.match("VB[0-9]{1,4}")) {
            return true;
        }
        if (name.match("VW[0-9]{1,4}")) {
            return true;
        }
        if (name.match("VD[0-9]{1,4}")) {
            return true;
        }
        return false;
    }
    getWordSize(wordLen) {
        switch (wordLen) {
            case WordLen.S7WLBit:
            case WordLen.S7WLByte:
                return 1;
            case WordLen.S7WLWord:
            case WordLen.S7WLCounter:
            case WordLen.S7WLTimer:
                return 2;
            case WordLen.S7WLDWord:
            case WordLen.S7WLReal:
                return 4;
            default:
                return 0;
        }
    }
    static calculateBit(base, num) {
        var x = Math.floor((num - 1) / 8);
        var y = 8 * (x + 1);
        var addr = base + x;
        var bit = 7 - (y - num);
        return new LogoAddress(addr, bit, WordLen.S7WLBit);
    }
    static calculateWord(base, num) {
        var addr = base + ((num - 1) * 2);
        return new LogoAddress(addr, 0, WordLen.S7WLWord);
    }
}
exports.Snap7Logo = Snap7Logo;
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
//# sourceMappingURL=snap7-logo.js.map