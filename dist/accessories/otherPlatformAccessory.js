"use strict";
// each service must implement at-minimum the "required characteristics" for the given service type
// see https://developers.homebridge.io/#/service/Lightbulb
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtherPlatformAccessory = void 0;
const md5_1 = require("../md5");
const logo_1 = require("../logo");
const switchPlatformAccessory_1 = require("./switchPlatformAccessory");
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
class OtherPlatformAccessory {
    model = "Other";
    api;
    service;
    information;
    subs;
    services;
    platform;
    device;
    name;
    isParentAccessory;
    constructor(api, platform, device) {
        this.name = device.name;
        this.api = api;
        this.platform = platform;
        this.device = device;
        this.subs = [];
        this.services = [];
        this.isParentAccessory = false;
        this.errorCheck();
        this.service = new this.api.hap.Service.ServiceLabel(this.device.name);
        this.service.getCharacteristic(this.platform.Characteristic.ServiceLabelNamespace)
            .onGet(this.getServiceLabelNamespace.bind(this));
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
    }
    errorCheck() {
    }
    getServices() {
        return this.services;
    }
    async getServiceLabelNamespace() {
        // validValues: [0, 1],
        return 0;
    }
}
exports.OtherPlatformAccessory = OtherPlatformAccessory;
//# sourceMappingURL=otherPlatformAccessory.js.map