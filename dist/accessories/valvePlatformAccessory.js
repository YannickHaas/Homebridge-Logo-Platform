"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValvePlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
class ValvePlatformAccessory {
    model = "Valve";
    api;
    service;
    information;
    subs;
    services;
    platform;
    device;
    pushButton;
    logging;
    updateActiveQueued;
    updateInUseQueued;
    updateRemainingDurationQueued;
    updateSetDurationQueued;
    updateIsConfiguredQueued;
    accStates = {
        Active: 0,
        InUse: 0,
        ValveType: 0,
        RemainingDuration: 0,
        SetDuration: 0,
        IsConfigured: 0
    };
    name;
    constructor(api, platform, device, parent) {
        this.name = device.name;
        this.api = api;
        this.platform = platform;
        this.device = device;
        this.pushButton = this.device.pushButton || this.platform.pushButton;
        this.logging = this.device.logging || 0;
        this.subs = [];
        this.services = [];
        this.errorCheck();
        this.accStates.ValveType = this.device.valveType;
        if (parent) {
            this.service = new this.api.hap.Service.Valve(this.device.name, this.device.valveZone);
            this.service.setCharacteristic(this.platform.Characteristic.ServiceLabelIndex, this.device.valveZone);
            this.accStates.ValveType = 1;
        }
        else {
            this.service = new this.api.hap.Service.Valve(this.device.name);
        }
        this.service.getCharacteristic(this.platform.Characteristic.Active)
            .onSet(this.setActive.bind(this))
            .onGet(this.getActive.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.InUse)
            .onGet(this.getInUse.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.ValveType)
            .onGet(this.getValveType.bind(this));
        if (this.device.valveGetRemainingDuration) {
            this.service.getCharacteristic(this.platform.Characteristic.RemainingDuration)
                .onGet(this.getRemainingDuration.bind(this));
        }
        if (this.device.valveSetDuration && this.device.valveGetDuration) {
            this.service.getCharacteristic(this.platform.Characteristic.SetDuration)
                .setProps({ minValue: 0, maxValue: 14400 })
                .onSet(this.setSetDuration.bind(this))
                .onGet(this.getSetDuration.bind(this));
        }
        if (this.device.valveSetIsConfiguredOn && this.device.valveSetIsConfiguredOff && this.device.valveGetIsConfigured) {
            this.service.getCharacteristic(this.platform.Characteristic.IsConfigured)
                .setProps({ perms: ["ev" /* Perms.NOTIFY */, "pr" /* Perms.PAIRED_READ */, "pw" /* Perms.PAIRED_WRITE */] })
                .onSet(this.setIsConfigured.bind(this))
                .onGet(this.getIsConfigured.bind(this));
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
        this.updateActiveQueued = false;
        this.updateInUseQueued = false;
        this.updateRemainingDurationQueued = false;
        this.updateSetDurationQueued = false;
        this.updateIsConfiguredQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateActive();
                this.updateInUse();
                this.updateRemainingDuration();
                this.updateSetDuration();
                this.updateIsConfigured();
            }, this.platform.config.updateInterval);
        }
        if (this.logging) {
            setInterval(() => {
                this.logAccessory();
            }, this.platform.loggerInterval);
        }
    }
    errorCheck() {
        if (!this.device.valveGetActive || !this.device.valveSetActiveOn || !this.device.valveSetActiveOff || !this.device.valveGetInUse) {
            this.platform.log.error('[%s] LOGO! Addresses not correct!', this.device.name);
        }
        if (this.device.valveParentIrrigationSystem && !this.device.valveZone) {
            this.platform.log.error('[%s] zone parameter must be set to be included in an IrrigationSystem', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async setActive(value) {
        this.accStates.Active = value;
        if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
            this.platform.log.info('[%s] Set Active <- %i', this.device.name, value);
        }
        let qItem;
        if (value) {
            qItem = new queue_1.QueueSendItem(this.device.valveSetActiveOn, value, this.pushButton);
        }
        else {
            qItem = new queue_1.QueueSendItem(this.device.valveSetActiveOff, value, this.pushButton);
        }
        this.platform.queue.bequeue(qItem);
    }
    async setSetDuration(value) {
        if (this.device.valveSetDuration) {
            this.accStates.SetDuration = value;
            if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                this.platform.log.info('[%s] Set SetDuration <- %i', this.device.name, value);
            }
            let qItem = new queue_1.QueueSendItem(this.device.valveSetDuration, this.accStates.SetDuration, 0);
            this.platform.queue.bequeue(qItem);
        }
    }
    async setIsConfigured(value) {
        this.accStates.IsConfigured = value;
        if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
            this.platform.log.info('[%s] Set Is Configured <- %i', this.device.name, value);
        }
        let qItem;
        if (value) {
            qItem = new queue_1.QueueSendItem(this.device.valveSetIsConfiguredOn, 1, this.pushButton);
        }
        else {
            qItem = new queue_1.QueueSendItem(this.device.valveSetIsConfiguredOff, this.pushButton, this.pushButton);
        }
        this.platform.queue.bequeue(qItem);
    }
    async getActive() {
        const isActive = this.accStates.Active;
        this.updateActive();
        return isActive;
    }
    async getValveType() {
        const isValveType = this.accStates.ValveType;
        return isValveType;
    }
    async getInUse() {
        const isInUse = this.accStates.InUse;
        this.updateInUse();
        return isInUse;
    }
    async getRemainingDuration() {
        const isRemainingDuration = this.accStates.RemainingDuration;
        this.updateRemainingDuration();
        return isRemainingDuration;
    }
    async getSetDuration() {
        const isSetDuration = this.accStates.SetDuration;
        this.updateSetDuration();
        return isSetDuration;
    }
    async getIsConfigured() {
        const IsConfigured = this.accStates.IsConfigured;
        this.updateIsConfigured();
        return IsConfigured;
    }
    updateActive() {
        if (this.updateActiveQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.valveGetActive, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.Active = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get Active -> %i', this.device.name, this.accStates.Active);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.Active, this.accStates.Active);
            }
            this.updateActiveQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateActiveQueued = true;
        }
    }
    updateInUse() {
        if (this.updateInUseQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.valveGetInUse, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.InUse = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get InUse -> %i', this.device.name, this.accStates.InUse);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.InUse, this.accStates.InUse);
            }
            this.updateInUseQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateInUseQueued = true;
        }
    }
    updateRemainingDuration() {
        if (this.device.valveGetRemainingDuration) {
            if (this.updateRemainingDurationQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.valveGetRemainingDuration, async (value) => {
                if (value != error_1.ErrorNumber.noData) {
                    this.accStates.RemainingDuration = value;
                    if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                        this.platform.log.info('[%s] Get RemainingDuration -> %i', this.device.name, this.accStates.RemainingDuration);
                    }
                    this.service.updateCharacteristic(this.api.hap.Characteristic.RemainingDuration, this.accStates.RemainingDuration);
                }
                this.updateRemainingDurationQueued = false;
            });
            if (this.platform.queue.enqueue(qItem) === 1) {
                this.updateRemainingDurationQueued = true;
            }
        }
    }
    updateSetDuration() {
        if (this.device.valveSetDuration && this.device.valveGetDuration) {
            if (this.updateSetDurationQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.valveGetDuration, async (value) => {
                if (value != error_1.ErrorNumber.noData) {
                    this.accStates.SetDuration = value;
                    if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                        this.platform.log.info('[%s] Get SetDuration -> %i', this.device.name, this.accStates.SetDuration);
                    }
                    this.service.updateCharacteristic(this.api.hap.Characteristic.SetDuration, this.accStates.SetDuration);
                }
                this.updateSetDurationQueued = false;
            });
            if (this.platform.queue.enqueue(qItem) === 1) {
                this.updateSetDurationQueued = true;
            }
        }
    }
    updateIsConfigured() {
        if (this.device.valveSetIsConfiguredOn && this.device.valveSetIsConfiguredOff && this.device.valveGetIsConfigured) {
            if (this.updateIsConfiguredQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.valveGetIsConfigured, async (value) => {
                if (value != error_1.ErrorNumber.noData) {
                    this.accStates.IsConfigured = value;
                    if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                        this.platform.log.info('[%s] Get IsConfigured -> %i', this.device.name, this.accStates.IsConfigured);
                    }
                    this.service.updateCharacteristic(this.api.hap.Characteristic.IsConfigured, this.accStates.IsConfigured);
                }
                this.updateIsConfiguredQueued = false;
            });
            if (this.platform.queue.enqueue(qItem) === 1) {
                this.updateIsConfiguredQueued = true;
            }
        }
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            let logItems = [];
            logItems.push(new logger_1.InfluxDBLogItem("Active", this.accStates.Active, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("InUse", this.accStates.InUse, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("RemainingDuration", this.accStates.RemainingDuration, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("SetDuration", this.accStates.SetDuration, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("IsConfigured", this.accStates.IsConfigured, logger_1.InfluxDBFild.Int));
            this.platform.influxDB.logMultipleValues(this.device.name, logItems);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            // this.fakegatoService.addEntry({time: Math.round(new Date().valueOf() / 1000), temp: this.sensStates.CurrentTemperature});
        }
    }
}
exports.ValvePlatformAccessory = ValvePlatformAccessory;
//# sourceMappingURL=valvePlatformAccessory.js.map