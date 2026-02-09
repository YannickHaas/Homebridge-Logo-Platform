import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class WatchdogPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    private fakegatoService;
    services: Service[];
    private platform;
    private device;
    private disconnect;
    private logging;
    private updateWatchdogStateQueued;
    private sensStates;
    name: string;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    getWatchdogState(): Promise<CharacteristicValue>;
    updateWatchdogState(): void;
    logAccessory(): void;
}
//# sourceMappingURL=watchdogPlatformAccessory.d.ts.map