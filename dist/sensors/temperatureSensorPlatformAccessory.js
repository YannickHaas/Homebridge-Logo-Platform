"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureSensorPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
class TemperatureSensorPlatformAccessory {
    model = "Temperature Sensor";
    api;
    service;
    information;
    fakegatoService;
    services;
    platform;
    device;
    logging;
    updateCurrentTemperatureQueued;
    sensStates = {
        CurrentTemperature: 0,
        MinTemperature: -270,
        MaxTemperature: 100,
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
        this.service = new this.api.hap.Service.TemperatureSensor(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.api.hap.Characteristic.CurrentTemperature)
            .setProps({ minValue: -100 })
            .onGet(this.getCurrentTemperature.bind(this));
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
        this.updateCurrentTemperatureQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateCurrentTemperature();
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
        if (!this.device.temperature) {
            this.platform.log.error('[%s] LOGO! Addresses not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async getCurrentTemperature() {
        const isCurrentTemperature = this.sensStates.CurrentTemperature;
        this.updateCurrentTemperature();
        return isCurrentTemperature;
    }
    updateCurrentTemperature() {
        if (this.updateCurrentTemperatureQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.temperature, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.sensStates.CurrentTemperature = value;
                if (this.device.convertValue) {
                    this.sensStates.CurrentTemperature = (value / 10);
                }
                if (this.sensStates.CurrentTemperature < this.sensStates.MinTemperature) {
                    this.sensStates.CurrentTemperature = this.sensStates.MinTemperature;
                }
                if (this.sensStates.CurrentTemperature > this.sensStates.MaxTemperature) {
                    this.sensStates.CurrentTemperature = this.sensStates.MaxTemperature;
                }
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get CurrentTemperature -> %f', this.device.name, this.sensStates.CurrentTemperature);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.CurrentTemperature, this.sensStates.CurrentTemperature);
            }
            this.updateCurrentTemperatureQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCurrentTemperatureQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            this.platform.influxDB.logFloatValue(this.device.name, "CurrentTemperature", this.sensStates.CurrentTemperature);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            this.fakegatoService.addEntry({ time: Math.round(new Date().valueOf() / 1000), temp: this.sensStates.CurrentTemperature });
        }
    }
}
exports.TemperatureSensorPlatformAccessory = TemperatureSensorPlatformAccessory;
//# sourceMappingURL=temperatureSensorPlatformAccessory.js.map