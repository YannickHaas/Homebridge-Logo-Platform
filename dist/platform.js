"use strict";
/*
Homebridge Dev Device Pi 4:
  Homebridge v1.6.1 (HAP v0.11.1)
  NPM v9.2.0
  NODE v18.13.0

HDMI Pi:
  Homebridge v1.7.0 (HAP v0.11.1)
  NPM v10.2.3
  NODE v20.5.1 -> Homebridge requires Node.js version of ^18.15.0 || ^20.7.0 which does not satisfy the current Node.js version of v20.5.1. You may need to upgrade your installation of Node.js - see https://homebridge.io/w/JTKEF
  
  */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoHomebridgePlatform = void 0;
const modbus_logo_1 = require("./modbus-logo");
const snap7_logo_1 = require("./snap7-logo");
const influxDB_1 = require("./influxDB");
const queue_1 = require("./queue");
const logger_1 = require("./logger");
const logo_1 = require("./logo");
const switchPlatformAccessory_1 = require("./accessories/switchPlatformAccessory");
const lightbulbPlatformAccessory_1 = require("./accessories/lightbulbPlatformAccessory");
const blindPlatformAccessory_1 = require("./accessories/blindPlatformAccessory");
const windowPlatformAccessory_1 = require("./accessories/windowPlatformAccessory");
const garagedoorPlatformAccessory_1 = require("./accessories/garagedoorPlatformAccessory");
const thermostatPlatformAccessory_1 = require("./accessories/thermostatPlatformAccessory");
const irrigationSystemPlatformAccessory_1 = require("./accessories/irrigationSystemPlatformAccessory");
const valvePlatformAccessory_1 = require("./accessories/valvePlatformAccessory");
const fanPlatformAccessory_1 = require("./accessories/fanPlatformAccessory");
const filterMaintenancePlatformAccessory_1 = require("./accessories/filterMaintenancePlatformAccessory");
const outletPlatformAccessory_1 = require("./accessories/outletPlatformAccessory");
const otherPlatformAccessory_1 = require("./accessories/otherPlatformAccessory");
const lightSensorPlatformAccessory_1 = require("./sensors/lightSensorPlatformAccessory");
const motionSensorPlatformAccessory_1 = require("./sensors/motionSensorPlatformAccessory");
const contactSensorPlatformAccessory_1 = require("./sensors/contactSensorPlatformAccessory");
const smokeSensorPlatformAccessory_1 = require("./sensors/smokeSensorPlatformAccessory");
const temperatureSensorPlatformAccessory_1 = require("./sensors/temperatureSensorPlatformAccessory");
const humiditySensorPlatformAccessory_1 = require("./sensors/humiditySensorPlatformAccessory");
const carbonDioxideSensorPlatformAccessory_1 = require("./sensors/carbonDioxideSensorPlatformAccessory");
const airQualitySensorPlatformAccessory_1 = require("./sensors/airQualitySensorPlatformAccessory");
const leakSensorPlatformAccessory_1 = require("./sensors/leakSensorPlatformAccessory");
const watchdogPlatformAccessory_1 = require("./sensors/watchdogPlatformAccessory");
const pjson = require('../package.json');
class LogoHomebridgePlatform {
    log;
    config;
    api;
    Service;
    Characteristic;
    logo;
    ip;
    interface;
    port;
    logoType;
    local_TSAP;
    remote_TSAP;
    debugMsgLog;
    retryCount;
    queue;
    queueInterval;
    queueSize;
    queueMinSize;
    updateTimer = null;
    accessoriesArray;
    manufacturer;
    model;
    firmwareRevision;
    pushButton;
    loggerType;
    loggerInterval;
    influxDB;
    FakeGatoHistoryService;
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        // this.log.debug('Finished initializing platform:', this.config.name);
        this.ip = this.config.ip;
        this.interface = this.config.interface || logo_1.LogoInterface.Modbus;
        this.port = this.config.port || logo_1.LogoDefault.Port;
        this.logoType = this.config.logoType || logo_1.LogoType.T_0BA7;
        this.local_TSAP = parseInt(this.config.localTSAP, 16) || logo_1.LogoDefault.LocalTSAP;
        this.remote_TSAP = parseInt(this.config.remoteTSAP, 16) || logo_1.LogoDefault.RemoteTSAP;
        this.debugMsgLog = this.config.debugMsgLog || logo_1.LogoDefault.DebugMsgLog;
        this.retryCount = this.config.retryCount || logo_1.LogoDefault.RetryCount;
        this.queueInterval = this.config.queueInterval || logo_1.LogoDefault.QueueInterval;
        this.queueSize = this.config.queueSize || logo_1.LogoDefault.QueueSize;
        this.queueMinSize = logo_1.LogoDefault.QueueMinSize;
        this.loggerType = this.config.loggerType || logger_1.LoggerType.None;
        this.loggerInterval = this.config.loggerInterval || logger_1.LoggerInterval.T_5Min;
        this.influxDB = new influxDB_1.InfluxDBLogger(this, this.config);
        this.FakeGatoHistoryService = require('fakegato-history')(this.api);
        if (this.interface == logo_1.LogoInterface.Modbus) {
            this.logo = new modbus_logo_1.ModBusLogo(this.ip, this.port, this.debugMsgLog, this.log, (this.retryCount + 1));
        }
        else {
            this.logo = new snap7_logo_1.Snap7Logo(this.logoType, this.ip, this.local_TSAP, this.remote_TSAP, this.debugMsgLog, this.log, (this.retryCount + 1));
        }
        this.queue = new queue_1.Queue(this.queueSize);
        this.accessoriesArray = [];
        this.manufacturer = pjson.author.name;
        this.model = pjson.model;
        this.firmwareRevision = pjson.version;
        this.pushButton = (this.config.pushButton ? 1 : 0);
        if (Array.isArray(this.config.devices)) {
            const configDevices = this.config.devices;
            for (const device of configDevices) {
                if (this.config.debugMsgLog == true) {
                    this.log.info('Adding new accessory: ', device.name);
                }
                switch (device.type) {
                    case logo_1.Accessory.Switch:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new switchPlatformAccessory_1.SwitchPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 1;
                        break;
                    case logo_1.Accessory.Lightbulb:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new lightbulbPlatformAccessory_1.LightbulbPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 2;
                        break;
                    case logo_1.Accessory.Blind:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new blindPlatformAccessory_1.BlindPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 4;
                        break;
                    case logo_1.Accessory.Window:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new windowPlatformAccessory_1.WindowPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 4;
                        break;
                    case logo_1.Accessory.Garagedoor:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new garagedoorPlatformAccessory_1.GaragedoorPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 3;
                        break;
                    case logo_1.Accessory.Thermostat:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new thermostatPlatformAccessory_1.ThermostatPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 4;
                        break;
                    case logo_1.Accessory.IrrigationSystem:
                        this.accessoriesArray.push(new irrigationSystemPlatformAccessory_1.IrrigationSystemPlatformAccessory(this.api, this, device));
                        this.queueMinSize += 5;
                        break;
                    case logo_1.Accessory.Valve:
                        if (!(device.valveParentIrrigationSystem)) {
                            this.accessoriesArray.push(new valvePlatformAccessory_1.ValvePlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 5;
                        break;
                    case logo_1.Accessory.Fan:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new fanPlatformAccessory_1.FanPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 3;
                        break;
                    case logo_1.Accessory.FilterMaintenance:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new filterMaintenancePlatformAccessory_1.FilterMaintenancePlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 2;
                        break;
                    case logo_1.Accessory.Outlet:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new outletPlatformAccessory_1.OutletPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 1;
                        break;
                    case logo_1.Accessory.Other:
                        this.accessoriesArray.push(new otherPlatformAccessory_1.OtherPlatformAccessory(this.api, this, device));
                        this.queueMinSize += 1;
                        break;
                    case logo_1.Accessory.LightSensor:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new lightSensorPlatformAccessory_1.LightSensorPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 1;
                        break;
                    case logo_1.Accessory.MotionSensor:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new motionSensorPlatformAccessory_1.MotionSensorPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 1;
                        break;
                    case logo_1.Accessory.ContactSensor:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new contactSensorPlatformAccessory_1.ContactSensorPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 1;
                        break;
                    case logo_1.Accessory.SmokeSensor:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new smokeSensorPlatformAccessory_1.SmokeSensorPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 1;
                        break;
                    case logo_1.Accessory.TemperatureSensor:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new temperatureSensorPlatformAccessory_1.TemperatureSensorPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 1;
                        break;
                    case logo_1.Accessory.HumiditySensor:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new humiditySensorPlatformAccessory_1.HumiditySensorPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 1;
                        break;
                    case logo_1.Accessory.CarbonDioxideSensor:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new carbonDioxideSensorPlatformAccessory_1.CarbonDioxideSensorPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 3;
                        break;
                    case logo_1.Accessory.AirQualitySensor:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new airQualitySensorPlatformAccessory_1.AirQualitySensorPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 1;
                        break;
                    case logo_1.Accessory.LeakSensor:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new leakSensorPlatformAccessory_1.LeakSensorPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 2;
                        break;
                    case logo_1.Accessory.Watchdog:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new watchdogPlatformAccessory_1.WatchdogPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 1;
                        break;
                    default:
                        if (!(device.parentAccessory)) {
                            this.accessoriesArray.push(new switchPlatformAccessory_1.SwitchPlatformAccessory(this.api, this, device));
                        }
                        this.queueMinSize += 1;
                        break;
                }
            }
        }
        if (this.queueMinSize > this.queueSize) {
            this.log.warn('Queue size is to small! Minimum size for all accessories and sensors is:', this.queueMinSize);
        }
        this.startUpdateTimer();
    }
    accessories(callback) {
        callback(this.accessoriesArray);
    }
    sendQueueItems() {
        if (this.queue.count() > 0) {
            // for logging Queue Size: add in Platform Main Configuration Parameters "debugMsgLogQueueSize": 1
            if (this.config.debugMsgLogQueueSize == true) {
                this.log.info('Queue size: ', this.queue.count());
            }
            // ### Timer OFF ####
            this.stopUpdateTimer();
            // ##################
            const item = this.queue.dequeue();
            if (item instanceof queue_1.QueueSendItem) {
                if (item.pushButton == 1) {
                    this.logo.WriteLogo(item.address, 1);
                    const pbItem = new queue_1.QueueSendItem(item.address, 0, 0);
                    this.queue.bequeue(pbItem);
                }
                else {
                    this.logo.WriteLogo(item.address, item.value);
                }
            }
            else {
                this.logo.ReadLogo(item.address, item.callBack);
            }
            // ### Timer ON ####
            this.startUpdateTimer();
            // #################
        }
    }
    isAnalogLogoAddress(addr) {
        return this.logo.isAnalogLogoAddress(addr);
    }
    startUpdateTimer() {
        this.updateTimer = setInterval(() => {
            this.sendQueueItems();
        }, this.queueInterval);
    }
    stopUpdateTimer() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
}
exports.LogoHomebridgePlatform = LogoHomebridgePlatform;
// https://developers.homebridge.io/#/config-schema#enabling-support-for-your-plugin
//# sourceMappingURL=platform.js.map