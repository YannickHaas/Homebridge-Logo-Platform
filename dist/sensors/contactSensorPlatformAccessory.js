"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSensorPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
class ContactSensorPlatformAccessory {
    model = "Contact Sensor";
    api;
    service;
    information;
    fakegatoService;
    services;
    platform;
    device;
    logging;
    updateContactSensorStateQueued;
    sensStates = {
        ContactSensorState: 0,
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
        this.service = new this.api.hap.Service.ContactSensor(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.api.hap.Characteristic.ContactSensorState)
            .onGet(this.getContactSensorState.bind(this));
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
        this.updateContactSensorStateQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateContactSensorState();
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
        if (!this.device.contact) {
            this.platform.log.error('[%s] LOGO! Addresses not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async getContactSensorState() {
        const isContactSensorState = this.sensStates.ContactSensorState;
        this.updateContactSensorState();
        return isContactSensorState;
    }
    updateContactSensorState() {
        if (this.updateContactSensorStateQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.contact, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.sensStates.ContactSensorState = (value == 1 ? 0 : 1);
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get ContactSensorState -> %i', this.device.name, this.sensStates.ContactSensorState);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.ContactSensorState, this.sensStates.ContactSensorState);
            }
            this.updateContactSensorStateQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateContactSensorStateQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            this.platform.influxDB.logIntegerValue(this.device.name, "ContactSensorState", this.sensStates.ContactSensorState);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            this.fakegatoService.addEntry({ time: Math.round(new Date().valueOf() / 1000), contact: this.sensStates.ContactSensorState });
        }
    }
}
exports.ContactSensorPlatformAccessory = ContactSensorPlatformAccessory;
//# sourceMappingURL=contactSensorPlatformAccessory.js.map