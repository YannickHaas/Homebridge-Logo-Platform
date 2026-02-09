import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class FilterMaintenancePlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    private subs;
    services: Service[];
    private platform;
    private device;
    private pushButton;
    private logging;
    private updateFilterChangeIndicationQueued;
    private updateFilterLifeLevelQueued;
    private accStates;
    name: string;
    isParentAccessory: boolean;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    setResetFilterIndication(value: CharacteristicValue): Promise<void>;
    getFilterChangeIndication(): Promise<CharacteristicValue>;
    getFilterLifeLevel(): Promise<CharacteristicValue>;
    updateFilterChangeIndication(): void;
    updateFilterLifeLevel(): void;
    logAccessory(): void;
}
//# sourceMappingURL=filterMaintenancePlatformAccessory.d.ts.map