"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeakSensorPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
class LeakSensorPlatformAccessory {
    model = "Leak Sensor";
    api;
    service;
    information;
    services;
    platform;
    device;
    logging;
    updateLeakDetectedQueued;
    updateWaterLevelQueued;
    sensStates = {
        LeakDetected: 0,
        WaterLevel: 0,
    };
    name;
    constructor(api, platform, device, parent) {
        this.name = device.name;
        this.api = api;
        this.platform = platform;
        this.device = device;
        this.logging = this.device.logging || 0;
        this.services = [];
        this.errorCheck();
        this.service = new this.api.hap.Service.LeakSensor(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.api.hap.Characteristic.LeakDetected)
            .onGet(this.getLeakDetected.bind(this));
        if (this.device.waterLevel) {
            this.service.getCharacteristic(this.api.hap.Characteristic.WaterLevel)
                .onGet(this.getWaterLevel.bind(this));
        }
        this.information = new this.api.hap.Service.AccessoryInformation()
            .setCharacteristic(this.api.hap.Characteristic.Manufacturer, this.platform.manufacturer)
            .setCharacteristic(this.api.hap.Characteristic.Model, this.model + ' @ ' + this.platform.model)
            .setCharacteristic(this.api.hap.Characteristic.SerialNumber, (0, md5_1.md5)(this.device.name + this.model))
            .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, this.platform.firmwareRevision);
        this.services.push(this.service, this.information);
        if (parent) {
            parent.service.addLinkedService(this.service);
            parent.services.push(this.service);
        }
        this.updateLeakDetectedQueued = false;
        this.updateWaterLevelQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateLeakDetected();
                this.updateWaterLevel();
            }, this.platform.config.updateInterval);
        }
        if (this.logging) {
            setInterval(() => {
                this.logAccessory();
            }, this.platform.loggerInterval);
        }
    }
    errorCheck() {
        if (!this.device.leak) {
            this.platform.log.error('[%s] LOGO! Addresses not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async getLeakDetected() {
        const isLeakDetected = this.sensStates.LeakDetected;
        this.updateLeakDetected();
        return isLeakDetected;
    }
    async getWaterLevel() {
        const isWaterLevel = this.sensStates.WaterLevel;
        this.updateWaterLevel();
        return isWaterLevel;
    }
    updateLeakDetected() {
        if (this.updateLeakDetectedQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.leak, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.sensStates.LeakDetected = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get LeakDetected -> %i', this.device.name, this.sensStates.LeakDetected);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.LeakDetected, this.sensStates.LeakDetected);
            }
            this.updateLeakDetectedQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateLeakDetectedQueued = true;
        }
        ;
    }
    updateWaterLevel() {
        if (this.device.waterLevel) {
            if (this.updateWaterLevelQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.waterLevel, async (value) => {
                if (value != error_1.ErrorNumber.noData) {
                    this.sensStates.WaterLevel = value;
                    if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                        this.platform.log.info('[%s] Get WaterLevel -> %f', this.device.name, this.sensStates.WaterLevel);
                    }
                    this.service.updateCharacteristic(this.api.hap.Characteristic.WaterLevel, this.sensStates.WaterLevel);
                }
                this.updateWaterLevelQueued = false;
            });
            if (this.platform.queue.enqueue(qItem) === 1) {
                this.updateWaterLevelQueued = true;
            }
            ;
        }
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            let logItems = [];
            logItems.push(new logger_1.InfluxDBLogItem("LeakDetected", this.sensStates.LeakDetected, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("WaterLevel", this.sensStates.WaterLevel, logger_1.InfluxDBFild.Int));
            this.platform.influxDB.logMultipleValues(this.device.name, logItems);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            // this.fakegatoService.addEntry({time: Math.round(new Date().valueOf() / 1000), temp: this.sensStates.CurrentTemperature});
        }
    }
}
exports.LeakSensorPlatformAccessory = LeakSensorPlatformAccessory;
//# sourceMappingURL=leakSensorPlatformAccessory.js.map