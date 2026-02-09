"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IrrigationSystemPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
const logo_1 = require("../logo");
const valvePlatformAccessory_1 = require("./valvePlatformAccessory");
class IrrigationSystemPlatformAccessory {
    model = "IrrigationSystem";
    api;
    service;
    information;
    valveAccessories;
    services;
    valveZones;
    platform;
    device;
    pushButton;
    logging;
    irrigationSystemAutoUpdate;
    updateActiveQueued;
    updateProgramModeQueued;
    updateInUseQueued;
    updateWaterLevelQueued;
    updateRemainingDurationQueued;
    accStates = {
        Active: 0,
        ProgramMode: 0,
        InUse: 0,
        RemainingDuration: 0,
        WaterLevel: 0
    };
    name;
    constructor(api, platform, device) {
        this.name = device.name;
        this.api = api;
        this.platform = platform;
        this.device = device;
        this.pushButton = this.device.pushButton || this.platform.pushButton;
        this.logging = this.device.logging || 0;
        this.irrigationSystemAutoUpdate = (this.device.irrigationSystemAutoUpdate ? 1 : 0);
        this.valveAccessories = [];
        this.services = [];
        this.valveZones = [];
        this.errorCheck();
        this.service = new this.api.hap.Service.IrrigationSystem(this.device.name);
        this.service.getCharacteristic(this.platform.Characteristic.Active)
            .onSet(this.setActive.bind(this))
            .onGet(this.getActive.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.ProgramMode)
            .onGet(this.getProgramMode.bind(this));
        if (this.device.irrigationSystemGetWaterLevel) {
            this.service.getCharacteristic((this.platform.Characteristic.WaterLevel))
                .onGet(this.getWaterLevel.bind(this));
        }
        this.service.getCharacteristic(this.platform.Characteristic.InUse)
            .onGet(this.getInUse.bind(this));
        if (this.device.irrigationSystemGetRemainingDuration) {
            this.service.getCharacteristic(this.platform.Characteristic.RemainingDuration)
                .onGet(this.getRemainingDuration.bind(this));
        }
        if (this.device.irrigationSystemGetWaterLevel) {
            this.service.getCharacteristic((this.platform.Characteristic.WaterLevel))
                .onGet(this.getWaterLevel.bind(this));
        }
        this.information = new this.api.hap.Service.AccessoryInformation()
            .setCharacteristic(this.api.hap.Characteristic.Manufacturer, this.platform.manufacturer)
            .setCharacteristic(this.api.hap.Characteristic.Model, this.model + ' @ ' + this.platform.model)
            .setCharacteristic(this.api.hap.Characteristic.SerialNumber, (0, md5_1.md5)(this.device.name + this.model))
            .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, this.platform.firmwareRevision);
        this.services.push(this.service, this.information);
        const configDevices = this.platform.config.devices;
        for (const dev of configDevices) {
            if ((dev.type == logo_1.Accessory.Valve) && (dev.valveParentIrrigationSystem == this.name)) {
                if (this.valveZones.includes(dev.valveZone)) {
                    this.platform.log.error('[%s] zone number [%d] already used on [%s] irrigation system!', dev.name, dev.valveZone, this.name);
                }
                else {
                    this.valveZones.push(dev.valveZone);
                }
                this.valveAccessories.push(new valvePlatformAccessory_1.ValvePlatformAccessory(api, platform, dev, this));
            }
        }
        this.updateActiveQueued = false;
        this.updateProgramModeQueued = false;
        this.updateInUseQueued = false;
        this.updateWaterLevelQueued = false;
        this.updateRemainingDurationQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateActive();
                this.updateProgramMode();
                this.updateInUse();
                this.updateWaterLevel();
                this.updateRemainingDuration();
            }, this.platform.config.updateInterval);
        }
        if (this.logging) {
            setInterval(() => {
                this.logAccessory();
            }, this.platform.loggerInterval);
        }
    }
    errorCheck() {
        if (!(this.device.irrigationSystemGetActive || this.device.irrigationSystemAutoUpdate) || !this.device.irrigationSystemSetActiveOn ||
            !this.device.irrigationSystemSetActiveOff || !this.device.irrigationSystemGetProgramMode || !(this.device.irrigationSystemGetInUse || this.device.irrigationSystemAutoUpdate)) {
            this.platform.log.error('[%s] One or more LOGO! Addresses are not correct!', this.device.name);
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
            qItem = new queue_1.QueueSendItem(this.device.irrigationSystemSetActiveOn, value, this.pushButton);
        }
        else {
            qItem = new queue_1.QueueSendItem(this.device.irrigationSystemSetActiveOff, value, this.pushButton);
        }
        this.platform.queue.bequeue(qItem);
    }
    async getActive() {
        const isActive = this.accStates.Active;
        this.updateActive();
        return isActive;
    }
    async getProgramMode() {
        const isProgramMode = this.accStates.ProgramMode;
        this.updateProgramMode();
        return isProgramMode;
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
    async getWaterLevel() {
        const WaterLevel = this.accStates.WaterLevel;
        this.updateWaterLevel();
        return WaterLevel;
    }
    updateActive() {
        if (this.irrigationSystemAutoUpdate) {
            let isActive = 0;
            for (const dev of this.valveAccessories) {
                isActive |= dev.getActive();
            }
            this.accStates.Active = isActive;
        }
        else {
            if (this.updateActiveQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.irrigationSystemGetActive, async (value) => {
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
            ;
        }
        ;
    }
    updateProgramMode() {
        if (this.updateProgramModeQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.irrigationSystemGetProgramMode, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.ProgramMode = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get ProgramMode -> %i', this.device.name, this.accStates.ProgramMode);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.ProgramMode, this.accStates.ProgramMode);
            }
            this.updateProgramModeQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateProgramModeQueued = true;
        }
        ;
    }
    updateInUse() {
        if (this.irrigationSystemAutoUpdate) {
            let isInUse = 0;
            for (const dev of this.valveAccessories) {
                isInUse |= dev.getInUse();
            }
            this.accStates.InUse = isInUse;
        }
        else {
            if (this.updateInUseQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.irrigationSystemGetInUse, async (value) => {
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
            ;
        }
        ;
    }
    updateRemainingDuration() {
        if (this.device.irrigationSystemGetRemainingDuration) {
            if (this.updateRemainingDurationQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.irrigationSystemGetRemainingDuration, async (value) => {
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
    updateWaterLevel() {
        if (this.device.irrigationSystemGetWaterLevel) {
            if (this.updateWaterLevelQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.irrigationSystemGetWaterLevel, async (value) => {
                if (value != error_1.ErrorNumber.noData) {
                    this.accStates.WaterLevel = value;
                    if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                        this.platform.log.info('[%s] Get WaterLevel -> %i', this.device.name, this.accStates.WaterLevel);
                    }
                    this.service.updateCharacteristic(this.api.hap.Characteristic.WaterLevel, this.accStates.WaterLevel);
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
            logItems.push(new logger_1.InfluxDBLogItem("Active", this.accStates.Active, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("ProgramMode", this.accStates.ProgramMode, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("InUse", this.accStates.InUse, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("RemainingDuration", this.accStates.RemainingDuration, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("WaterLevel", this.accStates.WaterLevel, logger_1.InfluxDBFild.Int));
            this.platform.influxDB.logMultipleValues(this.device.name, logItems);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            // this.fakegatoService.addEntry({time: Math.round(new Date().valueOf() / 1000), temp: this.sensStates.CurrentTemperature});
        }
    }
}
exports.IrrigationSystemPlatformAccessory = IrrigationSystemPlatformAccessory;
//# sourceMappingURL=irrigationSystemPlatformAccessory.js.map