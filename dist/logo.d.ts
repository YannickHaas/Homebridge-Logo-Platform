import { AccessoryPlugin, API, StaticPlatformPlugin } from 'homebridge';
import { SwitchPlatformAccessory } from './accessories/switchPlatformAccessory';
import { LightbulbPlatformAccessory } from './accessories/lightbulbPlatformAccessory';
import { BlindPlatformAccessory } from './accessories/blindPlatformAccessory';
import { WindowPlatformAccessory } from './accessories/windowPlatformAccessory';
import { GaragedoorPlatformAccessory } from './accessories/garagedoorPlatformAccessory';
import { ThermostatPlatformAccessory } from './accessories/thermostatPlatformAccessory';
import { IrrigationSystemPlatformAccessory } from './accessories/irrigationSystemPlatformAccessory';
import { ValvePlatformAccessory } from './accessories/valvePlatformAccessory';
import { FanPlatformAccessory } from './accessories/fanPlatformAccessory';
import { FilterMaintenancePlatformAccessory } from './accessories/filterMaintenancePlatformAccessory';
import { OutletPlatformAccessory } from './accessories/outletPlatformAccessory';
import { OtherPlatformAccessory } from './accessories/otherPlatformAccessory';
import { LightSensorPlatformAccessory } from './sensors/lightSensorPlatformAccessory';
import { MotionSensorPlatformAccessory } from './sensors/motionSensorPlatformAccessory';
import { ContactSensorPlatformAccessory } from './sensors/contactSensorPlatformAccessory';
import { SmokeSensorPlatformAccessory } from './sensors/smokeSensorPlatformAccessory';
import { TemperatureSensorPlatformAccessory } from './sensors/temperatureSensorPlatformAccessory';
import { HumiditySensorPlatformAccessory } from './sensors/humiditySensorPlatformAccessory';
import { CarbonDioxideSensorPlatformAccessory } from './sensors/carbonDioxideSensorPlatformAccessory';
import { AirQualitySensorPlatformAccessory } from './sensors/airQualitySensorPlatformAccessory';
import { LeakSensorPlatformAccessory } from './sensors/leakSensorPlatformAccessory';
import { WatchdogPlatformAccessory } from './sensors/watchdogPlatformAccessory';
export declare class LogoType {
    static T_0BA7: string;
    static T_0BA8: string;
    static T_0BA0: string;
    static T_0BA1: string;
}
export declare class LogoInterface {
    static Modbus: string;
    static Snap7: string;
}
export declare class LogoDefault {
    static Port: number;
    static LocalTSAP: number;
    static RemoteTSAP: number;
    static DebugMsgLog: number;
    static RetryCount: number;
    static QueueInterval: number;
    static QueueSize: number;
    static QueueMinSize: number;
}
export declare class Accessory {
    static Switch: string;
    static Lightbulb: string;
    static Blind: string;
    static Window: string;
    static Garagedoor: string;
    static Thermostat: string;
    static IrrigationSystem: string;
    static Valve: string;
    static Fan: string;
    static FilterMaintenance: string;
    static Outlet: string;
    static Other: string;
    static LightSensor: string;
    static MotionSensor: string;
    static ContactSensor: string;
    static SmokeSensor: string;
    static TemperatureSensor: string;
    static HumiditySensor: string;
    static CarbonDioxideSensor: string;
    static AirQualitySensor: string;
    static LeakSensor: string;
    static Watchdog: string;
}
export declare class SubAccessory {
    api: API;
    platform: StaticPlatformPlugin;
    constructor(api: API, platform: StaticPlatformPlugin);
    getNewAccessory(device: any, parent: any): SwitchPlatformAccessory | LightbulbPlatformAccessory | BlindPlatformAccessory | WindowPlatformAccessory | GaragedoorPlatformAccessory | ThermostatPlatformAccessory | IrrigationSystemPlatformAccessory | ValvePlatformAccessory | FanPlatformAccessory | FilterMaintenancePlatformAccessory | OutletPlatformAccessory | OtherPlatformAccessory | LightSensorPlatformAccessory | MotionSensorPlatformAccessory | ContactSensorPlatformAccessory | SmokeSensorPlatformAccessory | TemperatureSensorPlatformAccessory | HumiditySensorPlatformAccessory | CarbonDioxideSensorPlatformAccessory | AirQualitySensorPlatformAccessory | LeakSensorPlatformAccessory | AccessoryPlugin | WatchdogPlatformAccessory | undefined;
}
//# sourceMappingURL=logo.d.ts.map