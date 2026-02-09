"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchdogPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
class WatchdogPlatformAccessory {
    model = "Watchdog";
    api;
    service;
    information;
    fakegatoService;
    services;
    platform;
    device;
    disconnect;
    logging;
    updateWatchdogStateQueued;
    sensStates = {
        WatchdogState: 0,
    };
    name;
    constructor(api, platform, device, parent) {
        this.name = device.name;
        this.api = api;
        this.platform = platform;
        this.device = device;
        this.disconnect = this.device.disconnect || 0;
        this.logging = this.device.logging || 0;
        this.fakegatoService = [];
        this.services = [];
        this.errorCheck();
        this.service = new this.api.hap.Service.ContactSensor(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.api.hap.Characteristic.ContactSensorState)
            .onGet(this.getWatchdogState.bind(this));
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
        this.updateWatchdogStateQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateWatchdogState();
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
        if (!this.device.watchdog || !this.device.expectedValue) {
            this.platform.log.error('[%s] LOGO! Addresses not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async getWatchdogState() {
        const isWatchdogSensorState = this.sensStates.WatchdogState;
        this.updateWatchdogState();
        return isWatchdogSensorState;
    }
    updateWatchdogState() {
        if (this.updateWatchdogStateQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.watchdog, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                var numValue = value;
                var expectedValue = this.device.expectedValue;
                this.sensStates.WatchdogState = (numValue == expectedValue ? 1 : 0);
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get WatchdogState -> %i', this.device.name, this.sensStates.WatchdogState);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.ContactSensorState, this.sensStates.WatchdogState);
                if ((this.sensStates.WatchdogState == 0) && (this.disconnect == 1)) {
                    this.platform.logo.DisconnectS7();
                }
            }
            this.updateWatchdogStateQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateWatchdogStateQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            this.platform.influxDB.logIntegerValue(this.device.name, "WatchdogState", this.sensStates.WatchdogState);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            this.fakegatoService.addEntry({ time: Math.round(new Date().valueOf() / 1000), contact: this.sensStates.WatchdogState });
        }
    }
}
exports.WatchdogPlatformAccessory = WatchdogPlatformAccessory;
//# sourceMappingURL=watchdogPlatformAccessory.js.map