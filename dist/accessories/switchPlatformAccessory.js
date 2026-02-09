"use strict";
// each service must implement at-minimum the "required characteristics" for the given service type
// see https://developers.homebridge.io/#/service/Lightbulb
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchPlatformAccessory = void 0;
const queue_1 = require("../queue");
const error_1 = require("../error");
const logger_1 = require("../logger");
const md5_1 = require("../md5");
const logo_1 = require("../logo");
const lightbulbPlatformAccessory_1 = require("./lightbulbPlatformAccessory");
const blindPlatformAccessory_1 = require("./blindPlatformAccessory");
const windowPlatformAccessory_1 = require("./windowPlatformAccessory");
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
class SwitchPlatformAccessory {
    model = "Switch";
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
    updateOnQueued;
    accStates = {
        On: false,
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
        this.service = new this.api.hap.Service.Switch(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.api.hap.Characteristic.On)
            .onSet(this.setOn.bind(this))
            .onGet(this.getOn.bind(this));
        this.information = new this.api.hap.Service.AccessoryInformation()
            .setCharacteristic(this.api.hap.Characteristic.Manufacturer, this.platform.manufacturer)
            .setCharacteristic(this.api.hap.Characteristic.Model, this.model + ' @ ' + this.platform.model)
            .setCharacteristic(this.api.hap.Characteristic.SerialNumber, (0, md5_1.md5)(this.device.name + this.model))
            .setCharacteristic(this.api.hap.Characteristic.FirmwareRevision, this.platform.firmwareRevision);
        if (!parent) {
            const configDevices = this.platform.config.devices;
            for (const dev of configDevices) {
                if (dev.parentAccessory == this.name) {
                    this.isParentAccessory = true;
                    switch (dev.type) {
                        case logo_1.Accessory.Switch:
                            this.subs.push(new SwitchPlatformAccessory(api, platform, dev, this));
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
        }
        if (this.isParentAccessory == true) {
            this.service.subtype = 'main-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.services.push(this.service, this.information);
        if (parent) {
            parent.service.addLinkedService(this.service);
            parent.services.push(this.service);
        }
        this.updateOnQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateOn();
            }, this.platform.config.updateInterval);
        }
        if (this.logging) {
            setInterval(() => {
                this.logAccessory();
            }, this.platform.loggerInterval);
        }
    }
    errorCheck() {
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            this.fakegatoService = new this.platform.FakeGatoHistoryService("switch", this, { storage: 'fs' });
            this.services.push(this.fakegatoService);
        }
        if (!this.device.switchGet || !this.device.switchSetOn || !this.device.switchSetOff) {
            this.platform.log.error('[%s] One or more LOGO! Addresses are not correct!', this.device.name);
        }
    }
    getServices() {
        return this.services;
    }
    async setOn(value) {
        this.accStates.On = value;
        if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
            this.platform.log.info('[%s] Set On <- %s', this.device.name, value);
        }
        let qItem;
        if (value) {
            qItem = new queue_1.QueueSendItem(this.device.switchSetOn, value, this.pushButton);
        }
        else {
            qItem = new queue_1.QueueSendItem(this.device.switchSetOff, value, this.pushButton);
        }
        this.platform.queue.bequeue(qItem);
    }
    async getOn() {
        const isOn = this.accStates.On;
        this.updateOn();
        return isOn;
    }
    updateOn() {
        if (this.updateOnQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.switchGet, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                const on = value == 1 ? true : false;
                this.accStates.On = on;
                if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                    this.platform.log.info('[%s] Get On -> %s', this.device.name, this.accStates.On);
                }
                this.service.updateCharacteristic(this.api.hap.Characteristic.On, this.accStates.On);
            }
            this.updateOnQueued = false;
        });
        if (this.platform.queue.enqueue(qItem) === 1) {
            this.updateOnQueued = true;
        }
        ;
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            this.platform.influxDB.logBooleanValue(this.device.name, "On", this.accStates.On);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            this.fakegatoService.addEntry({ time: Math.round(new Date().valueOf() / 1000), status: this.accStates.On });
        }
    }
}
exports.SwitchPlatformAccessory = SwitchPlatformAccessory;
//# sourceMappingURL=switchPlatformAccessory.js.map