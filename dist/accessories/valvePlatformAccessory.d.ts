import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class ValvePlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    service: Service;
    private information;
    private subs;
    services: Service[];
    private platform;
    private device;
    private pushButton;
    private logging;
    private updateActiveQueued;
    private updateInUseQueued;
    private updateRemainingDurationQueued;
    private updateSetDurationQueued;
    private updateIsConfiguredQueued;
    private accStates;
    name: string;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    setActive(value: CharacteristicValue): Promise<void>;
    setSetDuration(value: CharacteristicValue): Promise<void>;
    setIsConfigured(value: CharacteristicValue): Promise<void>;
    getActive(): Promise<CharacteristicValue>;
    getValveType(): Promise<CharacteristicValue>;
    getInUse(): Promise<CharacteristicValue>;
    getRemainingDuration(): Promise<CharacteristicValue>;
    getSetDuration(): Promise<CharacteristicValue>;
    getIsConfigured(): Promise<CharacteristicValue>;
    updateActive(): void;
    updateInUse(): void;
    updateRemainingDuration(): void;
    updateSetDuration(): void;
    updateIsConfigured(): void;
    logAccessory(): void;
}
//# sourceMappingURL=valvePlatformAccessory.d.ts.map