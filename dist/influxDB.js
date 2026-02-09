"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfluxDBLogger = void 0;
const influxdb_client_1 = require("@influxdata/influxdb-client");
const logger_1 = require("./logger");
class InfluxDBLogger {
    platform;
    url;
    token;
    org;
    bucket;
    influxDB;
    isConfigured;
    constructor(platform, config) {
        this.platform = platform;
        this.url = config.influxDBUrl;
        this.token = config.influxDBToken;
        this.org = config.influxDBOrg;
        this.bucket = config.influxDBBucket;
        this.isConfigured = true;
        this.errorCheck();
        if (this.isConfigured) {
            const url = this.url;
            const token = this.token;
            this.influxDB = new influxdb_client_1.InfluxDB({ url, token });
        }
    }
    errorCheck() {
        if (this.platform.loggerType != logger_1.LoggerType.InfluxDB) {
            this.isConfigured = false;
        }
        else {
            if (!this.url || !this.token || !this.org || !this.bucket) {
                this.platform.log.error('[Logger] One or more config items are not correct!');
                this.isConfigured = false;
            }
        }
    }
    logMultipleValues(name, array) {
        if (this.platform.config.debugMsgLog) {
            this.platform.log.info('[%s] LOG %i Items', name, array.length);
        }
        const writeApi = this.influxDB.getWriteApi(this.org, this.bucket);
        writeApi.useDefaultTags({ device: String(this.platform.config.name) });
        const point1 = new influxdb_client_1.Point(name);
        array.forEach(element => {
            if (element.type == logger_1.InfluxDBFild.Bool) {
                point1.intField(element.characteristic, this.boolToNumber(element.value));
            }
            if (element.type == logger_1.InfluxDBFild.Int) {
                point1.intField(element.characteristic, element.value);
            }
            if (element.type == logger_1.InfluxDBFild.Float) {
                point1.floatField(element.characteristic, element.value);
            }
        });
        writeApi.writePoint(point1);
        writeApi.close().then(() => {
            if (this.platform.config.debugMsgLog) {
                this.platform.log.info('[%s] LOG WRITE FINISHED', name);
            }
        });
    }
    logBooleanValue(name, characteristic, value) {
        if (this.platform.config.debugMsgLog) {
            this.platform.log.info('[%s] LOG Characteristic %s -> %s', name, characteristic, value);
        }
        const writeApi = this.influxDB.getWriteApi(this.org, this.bucket);
        writeApi.useDefaultTags({ device: String(this.platform.config.name) });
        const point1 = new influxdb_client_1.Point(name)
            .intField(characteristic, this.boolToNumber(value));
        writeApi.writePoint(point1);
        writeApi.close().then(() => {
            if (this.platform.config.debugMsgLog) {
                this.platform.log.info('[%s] LOG WRITE FINISHED', name);
            }
        });
    }
    logIntegerValue(name, characteristic, value) {
        if (this.platform.config.debugMsgLog) {
            this.platform.log.info('[%s] LOG Characteristic %s -> %i', name, characteristic, value);
        }
        const writeApi = this.influxDB.getWriteApi(this.org, this.bucket);
        writeApi.useDefaultTags({ device: String(this.platform.config.name) });
        const point1 = new influxdb_client_1.Point(name)
            .intField(characteristic, value);
        writeApi.writePoint(point1);
        writeApi.close().then(() => {
            if (this.platform.config.debugMsgLog) {
                this.platform.log.info('[%s] LOG WRITE FINISHED', name);
            }
        });
    }
    logFloatValue(name, characteristic, value) {
        if (this.platform.config.debugMsgLog) {
            this.platform.log.info('[%s] LOG Characteristic %s -> %f', name, characteristic, value);
        }
        const writeApi = this.influxDB.getWriteApi(this.org, this.bucket);
        writeApi.useDefaultTags({ device: String(this.platform.config.name) });
        const point1 = new influxdb_client_1.Point(name)
            .floatField(characteristic, value);
        writeApi.writePoint(point1);
        writeApi.close().then(() => {
            if (this.platform.config.debugMsgLog) {
                this.platform.log.info('[%s] LOG WRITE FINISHED', name);
            }
        });
    }
    boolToNumber(bool) {
        if (String(bool) === 'true') {
            return 1;
        }
        if (String(bool) === '1') {
            return 1;
        }
        return 0;
    }
}
exports.InfluxDBLogger = InfluxDBLogger;
//# sourceMappingURL=influxDB.js.map