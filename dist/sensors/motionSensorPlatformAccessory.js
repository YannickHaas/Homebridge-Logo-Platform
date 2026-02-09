"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotionSensorPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
class MotionSensorPlatformAccessory {
    model = "Motion Sensor";
    api;
    service;
    information;
    fakegatoService;
    services;
    platform;
    device;
    logging;
    updateMotionDetectedQueued;
    sensStates = {
        MotionDetected: false,
    };
    name;
    constructor(api, platform, device, parent) {
        this.name = device.name;
        this.api = api;
        this.platform = platform;
        this.device = device;
        this.logging = this.device.logging || 0;
        this.fakegatoService = [];
        this.services = [];
        this.errorCheck();
        this.service = new this.api.hap.Service.MotionSensor(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.api.hap.Characteristic.MotionDetected)
            .onGet(this.getMotionDetected.bind(this));
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
        this.updateMotionDetectedQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateMotionDetected();
            }, this.platform.config.updateInterval);
        }
        if (this.logging) {
            if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
                this.fakegatoService = new this.platform.FakeGatoHistoryService("custom", this, { storage: 'fs' });
                this.services.push(this.fakegatoService);
            }
            setInterval(() => {
                this.logAccessory();
            }, this.platform.loggerInterval);
        }
    }
    errorCheck() {
        if (!this.device.motion) {
            this.platform.log.error('[%s] LOGO! Addresses not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async getMotionDetected() {
        const isMotionDetected = this.sensStates.MotionDetected;
        this.updateMotionDetected();
        return isMotionDetected;
    }
    updateMotionDetected() {
        if (this.updateMotionDetectedQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.motion, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.sensStates.MotionDetected = (value == 1 ? true : false);
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get MotionDetected -> %s', this.device.name, this.sensStates.MotionDetected);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.MotionDetected, this.sensStates.MotionDetected);
            }
            this.updateMotionDetectedQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateMotionDetectedQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            this.platform.influxDB.logBooleanValue(this.device.name, "MotionDetected", this.sensStates.MotionDetected);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            this.fakegatoService.addEntry({ time: Math.round(new Date().valueOf() / 1000), motion: this.sensStates.MotionDetected });
        }
    }
}
exports.MotionSensorPlatformAccessory = MotionSensorPlatformAccessory;
//# sourceMappingURL=motionSensorPlatformAccessory.js.map