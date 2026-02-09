"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightSensorPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
class LightSensorPlatformAccessory {
    model = "Light Sensor";
    api;
    service;
    information;
    fakegatoService;
    services;
    platform;
    device;
    logging;
    updateCurrentAmbientLightLevelQueued;
    sensStates = {
        MinAmbientLightLevel: 0.0001,
        MaxAmbientLightLevel: 100000,
        CurrentAmbientLightLevel: 0.0001,
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
        this.service = new this.api.hap.Service.LightSensor(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.api.hap.Characteristic.CurrentAmbientLightLevel)
            .onGet(this.getCurrentAmbientLightLevel.bind(this));
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
        this.updateCurrentAmbientLightLevelQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateCurrentAmbientLightLevel();
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
        if (!this.device.light) {
            this.platform.log.error('[%s] LOGO! Addresses not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async getCurrentAmbientLightLevel() {
        const isCurrentAmbientLightLevel = this.sensStates.CurrentAmbientLightLevel;
        this.updateCurrentAmbientLightLevel();
        return isCurrentAmbientLightLevel;
    }
    updateCurrentAmbientLightLevel() {
        if (this.updateCurrentAmbientLightLevelQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.light, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.sensStates.CurrentAmbientLightLevel = value;
                if (this.sensStates.CurrentAmbientLightLevel < this.sensStates.MinAmbientLightLevel) {
                    this.sensStates.CurrentAmbientLightLevel = this.sensStates.MinAmbientLightLevel;
                }
                if (this.sensStates.CurrentAmbientLightLevel > this.sensStates.MaxAmbientLightLevel) {
                    this.sensStates.CurrentAmbientLightLevel = this.sensStates.MaxAmbientLightLevel;
                }
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get CurrentAmbientLightLevel -> %f', this.device.name, this.sensStates.CurrentAmbientLightLevel);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.CurrentAmbientLightLevel, this.sensStates.CurrentAmbientLightLevel);
            }
            this.updateCurrentAmbientLightLevelQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCurrentAmbientLightLevelQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            this.platform.influxDB.logFloatValue(this.device.name, "CurrentAmbientLightLevel", this.sensStates.CurrentAmbientLightLevel);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            this.fakegatoService.addEntry({ time: Math.round(new Date().valueOf() / 1000), lux: this.sensStates.CurrentAmbientLightLevel });
        }
    }
}
exports.LightSensorPlatformAccessory = LightSensorPlatformAccessory;
//# sourceMappingURL=lightSensorPlatformAccessory.js.map