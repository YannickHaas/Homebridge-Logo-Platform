import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class AirQualitySensorPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    services: Service[];
    private platform;
    private device;
    private logging;
    private updateAirQualityQueued;
    private sensStates;
    name: string;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    getAirQuality(): Promise<CharacteristicValue>;
    updateAirQuality(): void;
    logAccessory(): void;
}
//# sourceMappingURL=airQualitySensorPlatformAccessory.d.ts.map