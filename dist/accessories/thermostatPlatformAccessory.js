"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThermostatPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
const logo_1 = require("../logo");
const switchPlatformAccessory_1 = require("./switchPlatformAccessory");
const lightbulbPlatformAccessory_1 = require("./lightbulbPlatformAccessory");
const blindPlatformAccessory_1 = require("./blindPlatformAccessory");
const windowPlatformAccessory_1 = require("./windowPlatformAccessory");
const garagedoorPlatformAccessory_1 = require("./garagedoorPlatformAccessory");
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
class ThermostatPlatformAccessory {
    model = "Thermostat";
    api;
    service;
    information;
    fakegatoService;
    subs;
    services;
    platform;
    device;
    pushButton;
    logging;
    updateCurrentHeatingCoolingStateQueued;
    updateTargetHeatingCoolingStateQueued;
    updateCurrentTemperatureQueued;
    updateTargetTemperatureQueued;
    accStates = {
        CurrentHeatingCoolingState: 0,
        TargetHeatingCoolingState: 0,
        CurrentTemperature: 0,
        TargetTemperature: 10,
        TemperatureDisplayUnits: 0,
        MinTemperature: -270,
        MaxTemperature: 100,
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
        this.fakegatoService = [];
        this.subs = [];
        this.services = [];
        this.isParentAccessory = false;
        this.errorCheck();
        this.service = new this.api.hap.Service.Thermostat(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
            .onGet(this.getCurrentHeatingCoolingState.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
            .onSet(this.setTargetHeatingCoolingState.bind(this))
            .onGet(this.getTargetHeatingCoolingState.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .onGet(this.getCurrentTemperature.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.TargetTemperature)
            .onSet(this.setTargetTemperature.bind(this))
            .onGet(this.getTargetTemperature.bind(this));
        this.service.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
            .onGet(this.getTemperatureDisplayUnits.bind(this));
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
                        this.subs.push(new garagedoorPlatformAccessory_1.GaragedoorPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.Thermostat:
                        this.subs.push(new ThermostatPlatformAccessory(api, platform, dev, this));
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
        this.updateCurrentHeatingCoolingStateQueued = false;
        this.updateTargetHeatingCoolingStateQueued = false;
        this.updateCurrentTemperatureQueued = false;
        this.updateTargetTemperatureQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateCurrentHeatingCoolingState();
                this.updateTargetHeatingCoolingState();
                this.updateCurrentTemperature();
                this.updateTargetTemperature();
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
        if (!this.device.thermostatGetHCState || !this.device.thermostatGetTargetHCState || !this.device.thermostatSetTargetHCState ||
            !this.device.thermostatGetTemp || !this.device.thermostatGetTargetTemp || !this.device.thermostatSetTargetTemp) {
            this.platform.log.error('[%s] One or more LOGO! Addresses are not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async setTargetHeatingCoolingState(value) {
        this.accStates.TargetHeatingCoolingState = value;
        if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
            this.platform.log.info('[%s] Set TargetHeatingCoolingState <- %i', this.device.name, value);
        }
        let qItem = new queue_1.QueueSendItem(this.device.thermostatSetTargetHCState, this.accStates.TargetHeatingCoolingState, 0);
        this.platform.queue.bequeue(qItem);
    }
    async setTargetTemperature(value) {
        this.accStates.TargetTemperature = value;
        if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
            this.platform.log.info('[%s] Set TargetTemperature <- %i', this.device.name, value);
        }
        let newValue;
        if (this.device.thermostatConvertValue) {
            newValue = (this.accStates.TargetTemperature * 10);
        }
        else {
            newValue = this.accStates.TargetTemperature;
        }
        let qItem = new queue_1.QueueSendItem(this.device.thermostatSetTargetTemp, newValue, 0);
        this.platform.queue.bequeue(qItem);
    }
    async getCurrentHeatingCoolingState() {
        const isCurrentHeatingCoolingState = this.accStates.CurrentHeatingCoolingState;
        this.updateCurrentHeatingCoolingState();
        return isCurrentHeatingCoolingState;
    }
    async getTargetHeatingCoolingState() {
        const isTargetHeatingCoolingState = this.accStates.TargetHeatingCoolingState;
        this.updateTargetHeatingCoolingState();
        return isTargetHeatingCoolingState;
    }
    async getCurrentTemperature() {
        const isCurrentTemperature = this.accStates.CurrentTemperature;
        this.updateCurrentTemperature();
        return isCurrentTemperature;
    }
    async getTargetTemperature() {
        const isTargetTemperature = this.accStates.TargetTemperature;
        this.updateTargetTemperature();
        return isTargetTemperature;
    }
    async getTemperatureDisplayUnits() {
        const isTemperatureDisplayUnits = this.accStates.TemperatureDisplayUnits;
        return isTemperatureDisplayUnits;
    }
    updateCurrentHeatingCoolingState() {
        if (this.updateCurrentHeatingCoolingStateQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.thermostatGetHCState, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.CurrentHeatingCoolingState = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get CurrentHeatingCoolingState -> %i', this.device.name, this.accStates.CurrentHeatingCoolingState);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.CurrentHeatingCoolingState, this.accStates.CurrentHeatingCoolingState);
            }
            this.updateCurrentHeatingCoolingStateQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCurrentHeatingCoolingStateQueued = true;
        }
        ;
    }
    updateTargetHeatingCoolingState() {
        if (this.updateTargetHeatingCoolingStateQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.thermostatGetTargetHCState, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.TargetHeatingCoolingState = value;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get TargetHeatingCoolingState -> %i', this.device.name, this.accStates.TargetHeatingCoolingState);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.TargetHeatingCoolingState, this.accStates.TargetHeatingCoolingState);
            }
            this.updateTargetHeatingCoolingStateQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateTargetHeatingCoolingStateQueued = true;
        }
        ;
    }
    updateCurrentTemperature() {
        if (this.updateCurrentTemperatureQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.thermostatGetTemp, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                if (this.device.thermostatConvertValue) {
                    this.accStates.CurrentTemperature = (value / 10);
                }
                else {
                    this.accStates.CurrentTemperature = value;
                }
                if (this.accStates.CurrentTemperature < this.accStates.MinTemperature) {
                    this.accStates.CurrentTemperature = this.accStates.MinTemperature;
                }
                if (this.accStates.CurrentTemperature > this.accStates.MaxTemperature) {
                    this.accStates.CurrentTemperature = this.accStates.MaxTemperature;
                }
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get CurrentTemperature -> %i', this.device.name, this.accStates.CurrentTemperature);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.CurrentTemperature, this.accStates.CurrentTemperature);
            }
            this.updateCurrentTemperatureQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateCurrentTemperatureQueued = true;
        }
        ;
    }
    updateTargetTemperature() {
        if (this.updateTargetTemperatureQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.thermostatGetTargetTemp, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                if (this.device.thermostatConvertValue) {
                    this.accStates.TargetTemperature = (value / 10);
                }
                else {
                    this.accStates.TargetTemperature = value;
                }
                if (this.accStates.TargetTemperature < 10) {
                    this.accStates.TargetTemperature = 10;
                }
                if (this.accStates.TargetTemperature > 38) {
                    this.accStates.TargetTemperature = 38;
                }
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get TargetTemperature -> %i', this.device.name, this.accStates.TargetTemperature);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.TargetTemperature, this.accStates.TargetTemperature);
            }
            this.updateTargetTemperatureQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateTargetTemperatureQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            let logItems = [];
            logItems.push(new logger_1.InfluxDBLogItem("CurrentHeatingCoolingState", this.accStates.CurrentHeatingCoolingState, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("TargetHeatingCoolingState", this.accStates.TargetHeatingCoolingState, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("CurrentTemperature", this.accStates.CurrentTemperature, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("TargetTemperature", this.accStates.TargetTemperature, logger_1.InfluxDBFild.Int));
            this.platform.influxDB.logMultipleValues(this.device.name, logItems);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            this.fakegatoService.addEntry({ time: Math.round(new Date().valueOf() / 1000), temp: this.accStates.CurrentTemperature, setTemp: this.accStates.TargetTemperature });
        }
    }
}
exports.ThermostatPlatformAccessory = ThermostatPlatformAccessory;
//# sourceMappingURL=thermostatPlatformAccessory.js.map