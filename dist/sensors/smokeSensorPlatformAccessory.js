"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmokeSensorPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
class SmokeSensorPlatformAccessory {
    model = "Smoke Sensor";
    api;
    service;
    information;
    services;
    platform;
    device;
    logging;
    updateSmokeDetectedQueued;
    sensStates = {
        SmokeDetected: 0,
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
        this.service = new this.api.hap.Service.SmokeSensor(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.api.hap.Characteristic.SmokeDetected)
            .onGet(this.getSmokeDetected.bind(this));
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
        this.updateSmokeDetectedQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateSmokeDetected();
            }, this.platform.config.updateInterval);
        }
        if (this.logging) {
            setInterval(() => {
                this.logAccessory();
            }, this.platform.loggerInterval);
        }
    }
    errorCheck() {
        if (!this.device.smoke) {
            this.platform.log.error('[%s] LOGO! Addresses not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async getSmokeDetected() {
        const isSmokeDetected = this.sensStates.SmokeDetected;
        this.updateSmokeDetected();
        return isSmokeDetected;
    }
    updateSmokeDetected() {
        if (this.updateSmokeDetectedQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.smoke, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.sensStates.SmokeDetected = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get SmokeDetected -> %i', this.device.name, this.sensStates.SmokeDetected);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.SmokeDetected, this.sensStates.SmokeDetected);
            }
            this.updateSmokeDetectedQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateSmokeDetectedQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            this.platform.influxDB.logIntegerValue(this.device.name, "SmokeDetected", this.sensStates.SmokeDetected);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            // this.fakegatoService.addEntry({time: Math.round(new Date().valueOf() / 1000), temp: this.sensStates.CurrentTemperature});
        }
    }
}
exports.SmokeSensorPlatformAccessory = SmokeSensorPlatformAccessory;
//# sourceMappingURL=smokeSensorPlatformAccessory.js.map