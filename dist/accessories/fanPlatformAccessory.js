"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FanPlatformAccessory = void 0;
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
const thermostatPlatformAccessory_1 = require("./thermostatPlatformAccessory");
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
class FanPlatformAccessory {
    model = "Fan";
    api;
    service;
    information;
    subs;
    services;
    platform;
    device;
    pushButton;
    logging;
    updateOnQueued;
    updateRotationDirectionQueued;
    updateRotationSpeedQueued;
    accStates = {
        On: false,
        RotationDirection: 0, // CW = 0 / CCW = 1
        RotationSpeed: 0,
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
        this.service = new this.api.hap.Service.Fan(this.device.name);
        if (parent) {
            this.service.subtype = 'sub-' + this.model + "-" + this.name.replace(" ", "-");
        }
        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onSet(this.setOn.bind(this))
            .onGet(this.getOn.bind(this));
        if (this.device.fanGetRotationDirection && this.device.fanSetRotationDirectionCW && this.device.fanSetRotationDirectionCCW) {
            this.service.getCharacteristic(this.platform.Characteristic.RotationDirection)
                .onSet(this.setRotationDirection.bind(this))
                .onGet(this.getRotationDirection.bind(this));
        }
        if (this.device.fanGetRotationSpeed && this.device.fanSetRotationSpeed) {
            this.service.getCharacteristic(this.platform.Characteristic.RotationSpeed)
                .onSet(this.setRotationSpeed.bind(this))
                .onGet(this.getRotationSpeed.bind(this));
        }
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
                        this.subs.push(new thermostatPlatformAccessory_1.ThermostatPlatformAccessory(api, platform, dev, this));
                        break;
                    case logo_1.Accessory.Fan:
                        this.subs.push(new FanPlatformAccessory(api, platform, dev, this));
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
        this.updateOnQueued = false;
        this.updateRotationDirectionQueued = false;
        this.updateRotationSpeedQueued = false;
        if (this.platform.config.updateInterval) {
            setInterval(() => {
                this.updateOn();
                this.updateRotationDirection();
                this.updateRotationSpeed();
            }, this.platform.config.updateInterval);
        }
        if (this.logging) {
            setInterval(() => {
                this.logAccessory();
            }, this.platform.loggerInterval);
        }
    }
    errorCheck() {
        if (!this.device.fanGet || !this.device.fanSetOn || !this.device.fanSetOff) {
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
            qItem = new queue_1.QueueSendItem(this.device.fanSetOn, value, this.pushButton);
        }
        else {
            qItem = new queue_1.QueueSendItem(this.device.fanSetOff, value, this.pushButton);
        }
        this.platform.queue.bequeue(qItem);
    }
    async setRotationDirection(value) {
        if (this.device.fanSetRotationDirectionCW && this.device.fanSetRotationDirectionCCW) {
            this.accStates.RotationDirection = value;
            if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                this.platform.log.info('[%s] Set RotationDirection <- %i', this.device.name, value);
            }
            let qItem;
            if (value) {
                qItem = new queue_1.QueueSendItem(this.device.fanSetRotationDirectionCW, value, this.pushButton);
            }
            else {
                qItem = new queue_1.QueueSendItem(this.device.fanSetRotationDirectionCCW, value, this.pushButton);
            }
            this.platform.queue.bequeue(qItem);
        }
    }
    async setRotationSpeed(value) {
        if (this.device.fanSetRotationSpeed) {
            this.accStates.RotationSpeed = value;
            if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                this.platform.log.info('[%s] Set RotationSpeed <- %i', this.device.name, value);
            }
            let qItem = new queue_1.QueueSendItem(this.device.fanSetRotationSpeed, this.accStates.RotationSpeed, 0);
            this.platform.queue.bequeue(qItem);
        }
    }
    async getOn() {
        const isOn = this.accStates.On;
        this.updateOn();
        return isOn;
    }
    async getRotationDirection() {
        const isRotationDirection = this.accStates.RotationDirection;
        this.updateRotationDirection();
        return isRotationDirection;
    }
    async getRotationSpeed() {
        const isRotationSpeed = this.accStates.RotationSpeed;
        this.updateRotationSpeed();
        return isRotationSpeed;
    }
    updateOn() {
        if (this.updateOnQueued) {
            return;
        }
        let qItem = new queue_1.QueueReceiveItem(this.device.fanGet, async (value) => {
            if (value != error_1.ErrorNumber.noData) {
                this.accStates.On = (value == 1 ? true : false);
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
    updateRotationDirection() {
        if (this.device.fanGetRotationDirection) {
            if (this.updateRotationDirectionQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.fanGetRotationDirection, async (value) => {
                if (value != error_1.ErrorNumber.noData) {
                    this.accStates.RotationDirection = value;
                    if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                        this.platform.log.info('[%s] Get RotationDirection -> %i', this.device.name, this.accStates.RotationDirection);
                    }
                    this.service.updateCharacteristic(this.api.hap.Characteristic.RotationDirection, this.accStates.RotationDirection);
                }
                this.updateRotationDirectionQueued = false;
            });
            if (this.platform.queue.enqueue(qItem) === 1) {
                this.updateRotationDirectionQueued = true;
            }
            ;
        }
    }
    updateRotationSpeed() {
        if (this.device.fanGetRotationSpeed) {
            if (this.updateRotationSpeedQueued) {
                return;
            }
            let qItem = new queue_1.QueueReceiveItem(this.device.fanGetRotationSpeed, async (value) => {
                if (value != error_1.ErrorNumber.noData) {
                    this.accStates.RotationSpeed = value;
                    if (this.platform.config.debugMsgLog || this.device.debugMsgLog) {
                        this.platform.log.info('[%s] Get RotationSpeed -> %i', this.device.name, this.accStates.RotationSpeed);
                    }
                    this.service.updateCharacteristic(this.api.hap.Characteristic.RotationSpeed, this.accStates.RotationSpeed);
                }
                this.updateRotationSpeedQueued = false;
            });
            if (this.platform.queue.enqueue(qItem) === 1) {
                this.updateRotationSpeedQueued = true;
            }
            ;
        }
    }
    logAccessory() {
        if ((this.platform.loggerType == logger_1.LoggerType.InfluxDB) && this.platform.influxDB.isConfigured) {
            let logItems = [];
            logItems.push(new logger_1.InfluxDBLogItem("On", this.accStates.On, logger_1.InfluxDBFild.Bool));
            logItems.push(new logger_1.InfluxDBLogItem("RotationDirection", this.accStates.RotationDirection, logger_1.InfluxDBFild.Int));
            logItems.push(new logger_1.InfluxDBLogItem("RotationSpeed", this.accStates.RotationSpeed, logger_1.InfluxDBFild.Int));
            this.platform.influxDB.logMultipleValues(this.device.name, logItems);
        }
        if (this.platform.loggerType == logger_1.LoggerType.Fakegato) {
            // this.fakegatoService.addEntry({time: Math.round(new Date().valueOf() / 1000), temp: this.sensStates.CurrentTemperature});
        }
    }
}
exports.FanPlatformAccessory = FanPlatformAccessory;
//# sourceMappingURL=fanPlatformAccessory.js.map