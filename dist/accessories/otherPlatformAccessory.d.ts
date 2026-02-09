import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class OtherPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    private subs;
    services: Service[];
    private platform;
    private device;
    name: string;
    isParentAccessory: boolean;
    constructor(api: API, platform: any, device: any);
    errorCheck(): void;
    getServices(): Service[];
    getServiceLabelNamespace(): Promise<CharacteristicValue>;
}
//# sourceMappingURL=otherPlatformAccessory.d.ts.map