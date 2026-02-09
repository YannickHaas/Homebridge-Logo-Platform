"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaragedoorPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
const logo_1 = require("../logo");
const switchPlatformAccessory_1 = require("./switchPlatformAccessory");
const lightbulbPlatformAccessory_1 = require("./lightbulbPlatformAccessory");
const blindPlatformAccessory_1 = require("./blindPlatformAccessory");
const windowPlatformAccessory_1 = require("./windowPlatformAccessory");
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
class GaragedoorPlatformAccessory {
    model = "Garagedoor";
    api;
    service;
    information;
    subs;
    services;
    platform;
    device;
    pushButton;
    logging;
    updateCurrentDoorStateAndTargetDoorStateQueued;
    updateCurrentDoorStateQueued;
    updateTargetDoorStateQueued;
    updateObstructionDetectedQueued;
    currentDoorStateIsTargetDoorStateInLogo;
    accStates = {
        CurrentDoorState: 1,
        TargetDoorState: 1,
        ObstructionDetected: false,
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
        this.currentDoorStateIsTargetDoorStateInLogo = this.checkDoorState();
        this.service = new this.api.hap.Service.GarageDoorOpener(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.platform.Characteristic.CurrentDoorState)
            .onGet(this.getCurrentDoorState.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.TargetDoorState)
            .onSet(this.setTargetDoorState.bind(this))
            .onGet(this.getTargetDoorState.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.TargetPosition)
            .onGet(this.getObstructionDetected.bind(this));
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
                        this.subs.push(new windowPlatformAccessory_1.WindowPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.Garagedoor:
                        this.subs.push(new GaragedoorPlatformAccessory(api, platform, dev, this));
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
        this.updateCurrentDoorStateAndTargetDoorStateQueued = false;
        this.updateCurrentDoorStateQueued = false;
        this.updateTargetDoorStateQueued = false;
        this.updateObstructionDetectedQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                if (this.currentDoorStateIsTargetDoorStateInLogo == 1) {
                    this.updateCurrentDoorStateAndTargetDoorState();
                }
                else {
                    this.updateCurrentDoorState();
                    this.updateTargetDoorState();
                }
                this.updateObstructionDetected();
            }, this.platform.config.updateInterval);
        }
        if (this.logging) {
            setInterval(() => {
                this.logAccessory();
            }, this.platform.loggerInterval);
        }
    }
    errorCheck() {
        if (!this.device.garagedoorGetState || !this.device.garagedoorGetTargetState || !this.device.garagedoorSetTargetState) {
            this.platform.log.error('[%s] One or more LOGO! Addresses are not correct!', this.device.name);
        }
    }
    checkDoorState() {
        if (this.device.garagedoorGetState == this.device.garagedoorGetTargetState) {
            return 1;
        }
        else {
            return 0;
        }
    }
    getServices() {
        return this.services;
    }
    async setTargetDoorState(value) {
        this.accStates.TargetDoorState = value;
        if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
            this.platform.log.info('[%s] Set TargetDoorState <- %i', this.device.name, value);
        }
        let qItem = new queue_1.QueueSendItem(this.device.garagedoorSetTargetState, this.accStates.TargetDoorState, 0);
        this.platform.queue.bequeue(qItem);
    }
    async getCurrentDoorState() {
        const isCurrentDoorState = this.accStates.CurrentDoorState;
        this.updateCurrentDoorState();
        return isCurrentDoorState;
    }
    async getTargetDoorState() {
        const isTargetDoorState = this.accStates.TargetDoorState;
        this.updateTargetDoorState();
        return isTargetDoorState;
    }
    async getObstructionDetected() {
        const isObstructionDetected = this.accStates.ObstructionDetected;
        this.updateObstructionDetected();
        return isObstructionDetected;
    }
    updateCurrentDoorState() {
        if (this.platform.isAnalogLogoAddress(this.device.garagedoorGetState)) {
            this.updateAnalogCurrentDoorState();
        }
        else {
            this.updateDigitalCurrentDoorState();
        }
    }
    updateTargetDoorState() {
        if (this.platform.isAnalogLogoAddress(this.device.garagedoorGetTargetState)) {
            this.updateAnalogTargetDoorState();
        }
        else {
            this.updateDigitalTargetDoorState();
        }
    }
    updateCurrentDoorStateAndTargetDoorState() {
        if (this.platform.isAnalogLogoAddress(this.device.garagedoorGetState)) {
            this.updateAnalogCurrentDoorStateAndTargetDoorState();
        }
        else {
            this.updateDigitalCurrentDoorStateAndTargetDoorState();
        }
    }
    updateObstructionDetected() {
        if (this.device.garagedoorObstruction) {
            if (this.updateObstructionDetectedQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.garagedoorObstruction, async (value) => {
                if (value != error_1.ErrorNumber.noData) {
                    this.accStates.ObstructionDetected = (value == 1 ? true : false);
                    if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                        this.platform.log.info('[%s] Get ObstructionDetected -> %s', this.device.name, this.accStates.ObstructionDetected);
                    }
                    this.service.updateCharacteristic(this.api.hap.Characteristic.ObstructionDetected, this.accStates.ObstructionDetected);
                }
                this.updateObstructionDetectedQueued = false;
            });
            if (this.platform.queue.enqueue(qItem) === 1) {
                this.updateObstructionDetectedQueued = true;
            }
            ;
        }
    }
    updateAnalogCurrentDoorState() {
        if (this.updateCurrentDoorStateQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.garagedoorGetState, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.CurrentDoorState = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get Analog CurrentDoorState -> %i', this.device.name, this.accStates.CurrentDoorState);
                }
                // HomeKit - 0 = open; 1 = closed; 2 = opening; 3 = closing; 4 = stoppt
                this.service.updateCharacteristic(this.api.hap.Characteristic.CurrentDoorState, this.accStates.CurrentDoorState);
            }
            this.updateCurrentDoorStateQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCurrentDoorStateQueued = true;
        }
        ;
    }
    updateAnalogTargetDoorState() {
        if (this.updateTargetDoorStateQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.garagedoorGetTargetState, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.TargetDoorState = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get Analog TargetDoorState -> %i', this.device.name, this.accStates.TargetDoorState);
                }
                // HomeKit - 0 = open; 1 = closed;
                this.service.updateCharacteristic(this.api.hap.Characteristic.TargetDoorState, this.accStates.TargetDoorState);
            }
            this.updateTargetDoorStateQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateTargetDoorStateQueued = true;
        }
        ;
    }
    updateAnalogCurrentDoorStateAndTargetDoorState() {
        if (this.updateCurrentDoorStateAndTargetDoorStateQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.garagedoorGetState, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.CurrentDoorState = value;
                this.accStates.TargetDoorState = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get Analog CurrentDoorState and TargetDoorState -> %i', this.device.name, this.accStates.CurrentDoorState);
                }
                // HomeKit - 0 = open; 1 = closed; 2 = opening; 3 = closing; 4 = stoppt
                this.service.updateCharacteristic(this.api.hap.Characteristic.CurrentDoorState, this.accStates.CurrentDoorState);
                // HomeKit - 0 = open; 1 = closed;
                this.service.updateCharacteristic(this.api.hap.Characteristic.TargetDoorState, this.accStates.TargetDoorState);
            }
            this.updateCurrentDoorStateAndTargetDoorStateQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCurrentDoorStateAndTargetDoorStateQueued = true;
        }
        ;
    }
    updateDigitalCurrentDoorState() {
        if (this.updateCurrentDoorStateQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.garagedoorGetState, async (value) => {
            // Logo return 1 for open !!
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.CurrentDoorState = (value == 1 ? 0 : 1);
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get Digital CurrentDoorState -> %i', this.device.name, this.accStates.CurrentDoorState);
                }
                // HomeKit - 0 = open; 1 = closed; 2 = opening; 3 = closing; 4 = stoppt
                this.service.updateCharacteristic(this.api.hap.Characteristic.CurrentDoorState, this.accStates.CurrentDoorState);
            }
            this.updateCurrentDoorStateQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCurrentDoorStateQueued = true;
        }
        ;
    }
    updateDigitalTargetDoorState() {
        if (this.updateTargetDoorStateQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.garagedoorGetTargetState, async (value) => {
            // Logo return 1 for open !!
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.TargetDoorState = (value == 1 ? 0 : 1);
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get Digital TargetDoorState -> %i', this.device.name, this.accStates.TargetDoorState);
                }
                // HomeKit - 0 = open; 1 = closed;
                this.service.updateCharacteristic(this.api.hap.Characteristic.TargetDoorState, this.accStates.TargetDoorState);
            }
            this.updateTargetDoorStateQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateTargetDoorStateQueued = true;
        }
        ;
    }
    updateDigitalCurrentDoorStateAndTargetDoorState() {
        if (this.updateCurrentDoorStateAndTargetDoorStateQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.garagedoorGetState, async (value) => {
            // Logo return 1 for open !!
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.CurrentDoorState = (value == 1 ? 0 : 1);
                this.accStates.TargetDoorState = (value == 1 ? 0 : 1);
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get Digital CurrentDoorState and TargetDoorState -> %i', this.device.name, this.accStates.CurrentDoorState);
                }
                // HomeKit - 0 = open; 1 = closed; 2 = opening; 3 = closing; 4 = stoppt
                this.service.updateCharacteristic(this.api.hap.Characteristic.CurrentDoorState, this.accStates.CurrentDoorState);
                // HomeKit - 0 = open; 1 = closed;
                this.service.updateCharacteristic(this.api.hap.Characteristic.TargetDoorState, this.accStates.TargetDoorState);
            }
            this.updateCurrentDoorStateAndTargetDoorStateQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCurrentDoorStateAndTargetDoorStateQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            let logItems = [];
            logItems.push(new logger_1.InfluxDBLogItem("CurrentDoorState", this.accStates.CurrentDoorState, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("TargetDoorState", this.accStates.TargetDoorState, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("ObstructionDetected", this.accStates.ObstructionDetected, logger_1.InfluxDBFild.Bool));
            this.platform.influxDB.logMultipleValues(this.device.name, logItems);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            // this.fakegatoService.addEntry({time: Math.round(new Date().valueOf() / 1000), temp: this.sensStates.CurrentTemperature});
        }
    }
}
exports.GaragedoorPlatformAccessory = GaragedoorPlatformAccessory;
//# sourceMappingURL=garagedoorPlatformAccessory.js.map