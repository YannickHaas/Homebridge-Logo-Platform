"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumiditySensorPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
class HumiditySensorPlatformAccessory {
    model = "Humidity Sensor";
    api;
    service;
    information;
    fakegatoService;
    services;
    platform;
    device;
    logging;
    updateCurrentRelativeHumidityQueued;
    sensStates = {
        CurrentRelativeHumidity: 0,
        MinRelativeHumidity: 0,
        MaxRelativeHumidity: 100,
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
        this.service = new this.api.hap.Service.HumiditySensor(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.api.hap.Characteristic.CurrentRelativeHumidity)
            .onGet(this.getCurrentRelativeHumidity.bind(this));
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
        this.updateCurrentRelativeHumidityQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateCurrentRelativeHumidity();
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
        if (!this.device.humidity) {
            this.platform.log.error('[%s] LOGO! Addresses not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async getCurrentRelativeHumidity() {
        const isCurrentRelativeHumidity = this.sensStates.CurrentRelativeHumidity;
        this.updateCurrentRelativeHumidity();
        return isCurrentRelativeHumidity;
    }
    updateCurrentRelativeHumidity() {
        if (this.updateCurrentRelativeHumidityQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.humidity, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.sensStates.CurrentRelativeHumidity = value;
                if (this.device.convertValue) {
                    this.sensStates.CurrentRelativeHumidity = (value / 10);
                }
                if (this.sensStates.CurrentRelativeHumidity < this.sensStates.MinRelativeHumidity) {
                    this.sensStates.CurrentRelativeHumidity = this.sensStates.MinRelativeHumidity;
                }
                if (this.sensStates.CurrentRelativeHumidity > this.sensStates.MaxRelativeHumidity) {
                    this.sensStates.CurrentRelativeHumidity = this.sensStates.MaxRelativeHumidity;
                }
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get CurrentRelativeHumidity -> %f', this.device.name, this.sensStates.CurrentRelativeHumidity);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.CurrentRelativeHumidity, this.sensStates.CurrentRelativeHumidity);
            }
            this.updateCurrentRelativeHumidityQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCurrentRelativeHumidityQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            this.platform.influxDB.logFloatValue(this.device.name, "CurrentRelativeHumidity", this.sensStates.CurrentRelativeHumidity);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            this.fakegatoService.addEntry({ time: Math.round(new Date().valueOf() / 1000), humidity: this.sensStates.CurrentRelativeHumidity });
        }
    }
}
exports.HumiditySensorPlatformAccessory = HumiditySensorPlatformAccessory;
//# sourceMappingURL=humiditySensorPlatformAccessory.js.map