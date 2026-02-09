import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class IrrigationSystemPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    service: Service;
    private information;
    private valveAccessories;
    services: Service[];
    private valveZones;
    private platform;
    private device;
    private pushButton;
    private logging;
    private irrigationSystemAutoUpdate;
    private updateActiveQueued;
    private updateProgramModeQueued;
    private updateInUseQueued;
    private updateWaterLevelQueued;
    private updateRemainingDurationQueued;
    private accStates;
    name: string;
    constructor(api: API, platform: any, device: any);
    errorCheck(): void;
    getServices(): Service[];
    setActive(value: CharacteristicValue): Promise<void>;
    getActive(): Promise<CharacteristicValue>;
    getProgramMode(): Promise<CharacteristicValue>;
    getInUse(): Promise<CharacteristicValue>;
    getRemainingDuration(): Promise<CharacteristicValue>;
    getWaterLevel(): Promise<CharacteristicValue>;
    updateActive(): void;
    updateProgramMode(): void;
    updateInUse(): void;
    updateRemainingDuration(): void;
    updateWaterLevel(): void;
    logAccessory(): void;
}
//# sourceMappingURL=irrigationSystemPlatformAccessory.d.ts.map