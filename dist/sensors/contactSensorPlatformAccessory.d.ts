import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class ContactSensorPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    private fakegatoService;
    services: Service[];
    private platform;
    private device;
    private logging;
    private updateContactSensorStateQueued;
    private sensStates;
    name: string;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    getContactSensorState(): Promise<CharacteristicValue>;
    updateContactSensorState(): void;
    logAccessory(): void;
}
//# sourceMappingURL=contactSensorPlatformAccessory.d.ts.map