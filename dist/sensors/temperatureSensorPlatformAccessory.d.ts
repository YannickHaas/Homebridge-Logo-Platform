import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class TemperatureSensorPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    private fakegatoService;
    services: Service[];
    private platform;
    private device;
    private logging;
    private updateCurrentTemperatureQueued;
    private sensStates;
    name: string;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    getCurrentTemperature(): Promise<CharacteristicValue>;
    updateCurrentTemperature(): void;
    logAccessory(): void;
}
//# sourceMappingURL=temperatureSensorPlatformAccessory.d.ts.map