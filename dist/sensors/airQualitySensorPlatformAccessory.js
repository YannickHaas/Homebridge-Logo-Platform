"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirQualitySensorPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
class AirQualitySensorPlatformAccessory {
    model = "Air Quality Sensor";
    api;
    service;
    information;
    services;
    platform;
    device;
    logging;
    updateAirQualityQueued;
    sensStates = {
        AirQuality: 0,
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
        this.service = new this.api.hap.Service.AirQualitySensor(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.api.hap.Characteristic.AirQuality)
            .onGet(this.getAirQuality.bind(this));
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
        this.updateAirQualityQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateAirQuality();
            }, this.platform.config.updateInterval);
        }
        if (this.logging) {
            setInterval(() => {
                this.logAccessory();
            }, this.platform.loggerInterval);
        }
    }
    errorCheck() {
        if (!this.device.airQuality) {
            this.platform.log.error('[%s] LOGO! Addresses not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async getAirQuality() {
        const isAirQuality = this.sensStates.AirQuality;
        this.updateAirQuality();
        return isAirQuality;
    }
    updateAirQuality() {
        if (this.updateAirQualityQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.airQuality, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.sensStates.AirQuality = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get AirQuality -> %i', this.device.name, this.sensStates.AirQuality);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.AirQuality, this.sensStates.AirQuality);
            }
            this.updateAirQualityQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateAirQualityQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            this.platform.influxDB.logIntegerValue(this.device.name, "AirQuality", this.sensStates.AirQuality);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            // this.fakegatoService.addEntry({time: Math.round(new Date().valueOf() / 1000), temp: this.sensStates.CurrentTemperature});
        }
    }
}
exports.AirQualitySensorPlatformAccessory = AirQualitySensorPlatformAccessory;
//# sourceMappingURL=airQualitySensorPlatformAccessory.js.map