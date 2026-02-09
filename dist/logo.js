"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubAccessory = exports.Accessory = exports.LogoDefault = exports.LogoInterface = exports.LogoType = void 0;
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
class LogoType {
    static T_0BA7 = "0BA7";
    static T_0BA8 = "0BA8";
    static T_0BA0 = "0BA0";
    static T_0BA1 = "0BA1";
}
exports.LogoType = LogoType;
class LogoInterface {
    static Modbus = "modbus";
    static Snap7 = "snap7";
}
exports.LogoInterface = LogoInterface;
class LogoDefault {
    static Port = 502;
    static LocalTSAP = 0x1200;
    static RemoteTSAP = 0x2200;
    static DebugMsgLog = 0;
    static RetryCount = 5;
    static QueueInterval = 100;
    static QueueSize = 100;
    static QueueMinSize = 0;
}
exports.LogoDefault = LogoDefault;
class Accessory {
    static Switch = "switch";
    static Lightbulb = "lightbulb";
    static Blind = "blind";
    static Window = "window";
    static Garagedoor = "garagedoor";
    static Thermostat = "thermostat";
    static IrrigationSystem = "irrigationSystem";
    static Valve = "valve";
    static Fan = "fan";
    static FilterMaintenance = "filterMaintenance";
    static Outlet = "outlet";
    static Other = "other";
    static LightSensor = "lightSensor";
    static MotionSensor = "motionSensor";
    static ContactSensor = "contactSensor";
    static SmokeSensor = "smokeSensor";
    static TemperatureSensor = "temperatureSensor";
    static HumiditySensor = "humiditySensor";
    static CarbonDioxideSensor = "carbonDioxideSensor";
    static AirQualitySensor = "airQualitySensor";
    static LeakSensor = "leakSensor";
    static Watchdog = "watchdog";
}
exports.Accessory = Accessory;
class SubAccessory {
    api;
    platform;
    constructor(api, platform) {
        this.api = api;
        this.platform = platform;
    }
    getNewAccessory(device, parent) {
        switch (device.type) {
            case Accessory.Switch:
                return new switchPlatformAccessory_1.SwitchPlatformAccessory(this.api, this.platform, device, parent);
                break;
            case Accessory.Lightbulb:
                return new lightbulbPlatformAccessory_1.LightbulbPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.Blind:
                return new blindPlatformAccessory_1.BlindPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.Window:
                return new windowPlatformAccessory_1.WindowPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.Garagedoor:
                return new garagedoorPlatformAccessory_1.GaragedoorPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.Thermostat:
                return new thermostatPlatformAccessory_1.ThermostatPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.IrrigationSystem:
                return new irrigationSystemPlatformAccessory_1.IrrigationSystemPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.Valve:
                if (!(device.valveParentIrrigationSystem)) {
                    return new valvePlatformAccessory_1.ValvePlatformAccessory(this.api, this.platform, device, parent);
                }
                break;
            case Accessory.Fan:
                return new fanPlatformAccessory_1.FanPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.FilterMaintenance:
                return new filterMaintenancePlatformAccessory_1.FilterMaintenancePlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.Outlet:
                return new outletPlatformAccessory_1.OutletPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.Other:
                return new otherPlatformAccessory_1.OtherPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.LightSensor:
                return new lightSensorPlatformAccessory_1.LightSensorPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.MotionSensor:
                return new motionSensorPlatformAccessory_1.MotionSensorPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.ContactSensor:
                return new contactSensorPlatformAccessory_1.ContactSensorPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.SmokeSensor:
                return new smokeSensorPlatformAccessory_1.SmokeSensorPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.TemperatureSensor:
                return new temperatureSensorPlatformAccessory_1.TemperatureSensorPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.HumiditySensor:
                return new humiditySensorPlatformAccessory_1.HumiditySensorPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.CarbonDioxideSensor:
                return new carbonDioxideSensorPlatformAccessory_1.CarbonDioxideSensorPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.AirQualitySensor:
                return new airQualitySensorPlatformAccessory_1.AirQualitySensorPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.LeakSensor:
                return new leakSensorPlatformAccessory_1.LeakSensorPlatformAccessory(this.api, this.platform, device);
                break;
            case Accessory.Watchdog:
                return new watchdogPlatformAccessory_1.WatchdogPlatformAccessory(this.api, this.platform, device);
                break;
        }
    }
}
exports.SubAccessory = SubAccessory;
//# sourceMappingURL=logo.js.map