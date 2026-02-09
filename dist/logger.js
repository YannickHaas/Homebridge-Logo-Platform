"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfluxDBLogItem = exports.InfluxDBFild = exports.LoggerInterval = exports.LoggerType = void 0;
class LoggerType {
    static None = 'none';
    static InfluxDB = 'influxDB';
    static Fakegato = 'fakegato';
}
exports.LoggerType = LoggerType;
class LoggerInterval {
    static T_30Sec = 30000;
    static T_5Min = 300000;
}
exports.LoggerInterval = LoggerInterval;
class InfluxDBFild {
    static Bool = 0;
    static Int = 1;
    static Float = 2;
}
exports.InfluxDBFild = InfluxDBFild;
class InfluxDBLogItem {
    characteristic;
    value;
    type;
    constructor(characteristic, value, type) {
        this.characteristic = characteristic;
        this.value = value;
        this.type = type;
    }
}
exports.InfluxDBLogItem = InfluxDBLogItem;
//# sourceMappingURL=logger.js.map