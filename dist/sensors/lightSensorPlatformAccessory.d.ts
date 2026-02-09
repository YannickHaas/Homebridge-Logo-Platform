import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class LightSensorPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    private fakegatoService;
    services: Service[];
    private platform;
    private device;
    private logging;
    private updateCurrentAmbientLightLevelQueued;
    private sensStates;
    name: string;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    getCurrentAmbientLightLevel(): Promise<CharacteristicValue>;
    updateCurrentAmbientLightLevel(): void;
    logAccessory(): void;
}
//# sourceMappingURL=lightSensorPlatformAccessory.d.ts.map