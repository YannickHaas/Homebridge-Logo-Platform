import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class HumiditySensorPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    private fakegatoService;
    services: Service[];
    private platform;
    private device;
    private logging;
    private updateCurrentRelativeHumidityQueued;
    private sensStates;
    name: string;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    getCurrentRelativeHumidity(): Promise<CharacteristicValue>;
    updateCurrentRelativeHumidity(): void;
    logAccessory(): void;
}
//# sourceMappingURL=humiditySensorPlatformAccessory.d.ts.map