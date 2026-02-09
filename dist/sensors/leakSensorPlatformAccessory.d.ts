import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class LeakSensorPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    services: Service[];
    private platform;
    private device;
    private logging;
    private updateLeakDetectedQueued;
    private updateWaterLevelQueued;
    private sensStates;
    name: string;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    getLeakDetected(): Promise<CharacteristicValue>;
    getWaterLevel(): Promise<CharacteristicValue>;
    updateLeakDetected(): void;
    updateWaterLevel(): void;
    logAccessory(): void;
}
//# sourceMappingURL=leakSensorPlatformAccessory.d.ts.map