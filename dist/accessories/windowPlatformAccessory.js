"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
const logo_1 = require("../logo");
const switchPlatformAccessory_1 = require("./switchPlatformAccessory");
const lightbulbPlatformAccessory_1 = require("./lightbulbPlatformAccessory");
const blindPlatformAccessory_1 = require("./blindPlatformAccessory");
const garagedoorPlatformAccessory_1 = require("./garagedoorPlatformAccessory");
const thermostatPlatformAccessory_1 = require("./thermostatPlatformAccessory");
const fanPlatformAccessory_1 = require("./fanPlatformAccessory");
const filterMaintenancePlatformAccessory_1 = require("./filterMaintenancePlatformAccessory");
const outletPlatformAccessory_1 = require("./outletPlatformAccessory");
const lightSensorPlatformAccessory_1 = require("../sensors/lightSensorPlatformAccessory");
const motionSensorPlatformAccessory_1 = require("../sensors/motionSensorPlatformAccessory");
const contactSensorPlatformAccessory_1 = require("../sensors/contactSensorPlatformAccessory");
const smokeSensorPlatformAccessory_1 = require("../sensors/smokeSensorPlatformAccessory");
const temperatureSensorPlatformAccessory_1 = require("../sensors/temperatureSensorPlatformAccessory");
const humiditySensorPlatformAccessory_1 = require("../sensors/humiditySensorPlatformAccessory");
const carbonDioxideSensorPlatformAccessory_1 = require("../sensors/carbonDioxideSensorPlatformAccessory");
const airQualitySensorPlatformAccessory_1 = require("../sensors/airQualitySensorPlatformAccessory");
const leakSensorPlatformAccessory_1 = require("../sensors/leakSensorPlatformAccessory");
const watchdogPlatformAccessory_1 = require("../sensors/watchdogPlatformAccessory");
class WindowPlatformAccessory {
    model = "Window";
    api;
    service;
    information;
    subs;
    services;
    platform;
    device;
    pushButton;
    logging;
    updateCurrentPositionAndTargetPositionQueued;
    updateCurrentPositionQueued;
    updateTargetPositionQueued;
    updatePositionStateQueued;
    currentPositionIsTargetPositionInLogo;
    accStates = {
        CurrentPosition: 0,
        PositionState: 0, // 0 - DECREASING; 1 - INCREASING; 2 - STOPPED
        TargetPosition: 0,
        HoldPosition: false,
    };
    name;
    isParentAccessory;
    constructor(api, platform, device, parent) {
        this.name = device.name;
        this.api = api;
        this.platform = platform;
        this.device = device;
        this.pushButton = this.device.pushButton || this.platform.pushButton;
        this.logging = this.device.logging || 0;
        this.subs = [];
        this.services = [];
        this.isParentAccessory = false;
        this.errorCheck();
        this.currentPositionIsTargetPositionInLogo = this.checkPosition();
        this.service = new this.api.hap.Service.Window(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.platform.Characteristic.CurrentPosition)
            .onGet(this.getCurrentPosition.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.PositionState)
            .onGet(this.getPositionState.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
            .onSet(this.setTargetPosition.bind(this))
            .onGet(this.getTargetPosition.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.HoldPosition)
            .onSet(this.setHoldPosition.bind(this));
        this.information = new this.api.hap.Service.AccessoryInformation()
            .setCharacteristic(this.api.hap.Characteristic.Manufacturer, this.platform.manufacturer)
            .setCharacteristic(this.api.hap.Characteristic.Model, this.model + ' @ ' + this.platform.model)
            .setCharacteristic(this.api.hap.Characteristic.SerialNumber, (0, md5_1.md5)(this.device.name + this.model))
            .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, this.platform.firmwareRevision);
        const configDevices = this.platform.config.devices;
        for (const dev of configDevices) {
            if (dev.parentAccessory == this.name) {
                this.isParentAccessory = true;
                switch (dev.type) {
                    case logo_1.Accessory.Switch:
                        this.subs.push(new switchPlatformAccessory_1.SwitchPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.Lightbulb:
                        this.subs.push(new lightbulbPlatformAccessory_1.LightbulbPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.Blind:
                        this.subs.push(new blindPlatformAccessory_1.BlindPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.Window:
                        this.subs.push(new WindowPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.Garagedoor:
                        this.subs.push(new garagedoorPlatformAccessory_1.GaragedoorPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.Thermostat:
                        this.subs.push(new thermostatPlatformAccessory_1.ThermostatPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.Fan:
                        this.subs.push(new fanPlatformAccessory_1.FanPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.FilterMaintenance:
                        this.subs.push(new filterMaintenancePlatformAccessory_1.FilterMaintenancePlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.Outlet:
                        this.subs.push(new outletPlatformAccessory_1.OutletPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.LightSensor:
                        this.subs.push(new lightSensorPlatformAccessory_1.LightSensorPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.MotionSensor:
                        this.subs.push(new motionSensorPlatformAccessory_1.MotionSensorPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.ContactSensor:
                        this.subs.push(new contactSensorPlatformAccessory_1.ContactSensorPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.SmokeSensor:
                        this.subs.push(new smokeSensorPlatformAccessory_1.SmokeSensorPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.TemperatureSensor:
                        this.subs.push(new temperatureSensorPlatformAccessory_1.TemperatureSensorPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.HumiditySensor:
                        this.subs.push(new humiditySensorPlatformAccessory_1.HumiditySensorPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.CarbonDioxideSensor:
                        this.subs.push(new carbonDioxideSensorPlatformAccessory_1.CarbonDioxideSensorPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.AirQualitySensor:
                        this.subs.push(new airQualitySensorPlatformAccessory_1.AirQualitySensorPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.LeakSensor:
                        this.subs.push(new leakSensorPlatformAccessory_1.LeakSensorPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.Watchdog:
                        this.subs.push(new watchdogPlatformAccessory_1.WatchdogPlatformAccessory(api, platform, dev, this));
                        break;
                }
            }
        }
        if (this.isParentAccessory == true) {
            this.service.subtype = 'main-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.services.push(this.service, this.information);
        if (parent) {
            parent.service.addLinkedService(this.service);
            parent.services.push(this.service);
        }
        this.updateCurrentPositionAndTargetPositionQueued = false;
        this.updateCurrentPositionQueued = false;
        this.updateTargetPositionQueued = false;
        this.updatePositionStateQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                if (this.currentPositionIsTargetPositionInLogo == 1) {
                    this.updateCurrentPositionAndTargetPosition();
                }
                else {
                    this.updateCurrentPosition();
                    this.updateTargetPosition();
                }
                this.updatePositionState();
            }, this.platform.config.updateInterval);
        }
        if (this.logging) {
            setInterval(() => {
                this.logAccessory();
            }, this.platform.loggerInterval);
        }
    }
    errorCheck() {
        if (!this.device.windowSetTargetPos || !this.device.windowGetTargetPos || !this.device.windowGetPos || !this.device.windowGetState) {
            this.platform.log.error('[%s] One or more LOGO! Addresses are not correct!', this.device.name);
        }
    }
    checkPosition() {
        if (this.device.windowGetTargetPos == this.device.windowGetPos) {
            return 1;
        }
        else {
            return 0;
        }
    }
    getServices() {
        return this.services;
    }
    async setTargetPosition(value) {
        this.accStates.TargetPosition = value;
        if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
            this.platform.log.info('[%s] Set TargetPosition <- %i', this.device.name, value);
        }
        let qItem = new queue_1.QueueSendItem(this.device.windowSetTargetPos, this.windowLogoPosToHomebridgePos(value, this.device.windowConvertValue), 0);
        this.platform.queue.bequeue(qItem);
    }
    async setHoldPosition(value) {
        this.accStates.HoldPosition = value;
        if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
            this.platform.log.info('[%s] Set HoldPosition <- %s', this.device.name, value);
        }
        //  HomeKit -> 2 - STOPPED
        if (value == true) {
            this.setTargetPosition(2);
        }
    }
    async getCurrentPosition() {
        const isCurrentPosition = this.accStates.CurrentPosition;
        this.updateCurrentPosition();
        return isCurrentPosition;
    }
    async getPositionState() {
        const isPositionState = this.accStates.PositionState;
        this.updatePositionState();
        return isPositionState;
    }
    async getTargetPosition() {
        const isTargetPosition = this.accStates.TargetPosition;
        this.updateTargetPosition();
        return isTargetPosition;
    }
    updateCurrentPosition() {
        if (this.updateCurrentPositionQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.windowGetPos, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.CurrentPosition = this.windowLogoPosToHomebridgePos(value, this.device.windowConvertValue);
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get CurrentPosition -> %i', this.device.name, this.accStates.CurrentPosition);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.CurrentPosition, this.accStates.CurrentPosition);
            }
            this.updateCurrentPositionQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCurrentPositionQueued = true;
        }
        ;
    }
    updatePositionState() {
        if (this.updatePositionStateQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.windowGetState, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.PositionState = this.windowLogoStateToHomebridgeState(value, this.device.windowConvertValue);
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get PositionState -> %i', this.device.name, this.accStates.PositionState);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.PositionState, this.accStates.PositionState);
            }
            this.updatePositionStateQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updatePositionStateQueued = true;
        }
        ;
    }
    updateTargetPosition() {
        if (this.updateTargetPositionQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.windowGetTargetPos, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.TargetPosition = this.windowLogoPosToHomebridgePos(value, this.device.windowConvertValue);
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get TargetPosition -> %i', this.device.name, this.accStates.TargetPosition);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.TargetPosition, this.accStates.TargetPosition);
            }
            this.updateTargetPositionQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateTargetPositionQueued = true;
        }
        ;
    }
    updateCurrentPositionAndTargetPosition() {
        if (this.updateCurrentPositionAndTargetPositionQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.windowGetPos, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.CurrentPosition = this.windowLogoPosToHomebridgePos(value, this.device.windowConvertValue);
                this.accStates.TargetPosition = this.windowLogoPosToHomebridgePos(value, this.device.windowConvertValue);
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get CurrentPosition and TargetPosition -> %i', this.device.name, this.accStates.CurrentPosition);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.CurrentPosition, this.accStates.CurrentPosition);
                this.service.updateCharacteristic(this.api.hap.Characteristic.TargetPosition, this.accStates.TargetPosition);
            }
            this.updateCurrentPositionAndTargetPositionQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCurrentPositionAndTargetPositionQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            let logItems = [];
            logItems.push(new logger_1.InfluxDBLogItem("CurrentPosition", this.accStates.CurrentPosition, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("PositionState", this.accStates.PositionState, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("TargetPosition", this.accStates.TargetPosition, logger_1.InfluxDBFild.Int));
            this.platform.influxDB.logMultipleValues(this.device.name, logItems);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            // this.fakegatoService.addEntry({time: Math.round(new Date().valueOf() / 1000), temp: this.sensStates.CurrentTemperature});
        }
    }
    windowLogoPosToHomebridgePos(value, convert) {
        if (convert) {
            return (100 - value);
        }
        else {
            return value;
        }
    }
    windowLogoStateToHomebridgeState(value, convert) {
        /*
         * LOGO!
         * 0 - STOPP
         * 1 - UP   -> more open  -> 0%
         * 2 - DOWN -> more close -> 100%
         * Value 100 == 100% closed
         *
         * HomeKit
         * 0 - DECREASING -> - -> more closed -> 0%
         * 1 - INCREASING -> + -> more open   -> 100%
         * 2 - STOPPED
         * Value 100 == 100% open
         */
        if (convert) {
            let newValue;
            switch (value) {
                case 0: // LOGO! Stop
                    newValue = 2; // Homebridge STOPPED
                    break;
                case 1: // LOGO! Up
                    newValue = 1; // Homebridge INCREASING
                    break;
                case 2: // LOGO! Down
                    newValue = 0; // Homebridge DECREASING
                    break;
                default:
                    newValue = 2; // Homebridge STOPPED
                    break;
            }
            return newValue;
        }
        else {
            return value;
        }
    }
}
exports.WindowPlatformAccessory = WindowPlatformAccessory;
//# sourceMappingURL=windowPlatformAccessory.js.map