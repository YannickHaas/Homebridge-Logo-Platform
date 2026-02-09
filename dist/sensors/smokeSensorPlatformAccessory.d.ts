import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class SmokeSensorPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    services: Service[];
    private platform;
    private device;
    private logging;
    private updateSmokeDetectedQueued;
    private sensStates;
    name: string;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    getSmokeDetected(): Promise<CharacteristicValue>;
    updateSmokeDetected(): void;
    logAccessory(): void;
}
//# sourceMappingURL=smokeSensorPlatformAccessory.d.ts.map