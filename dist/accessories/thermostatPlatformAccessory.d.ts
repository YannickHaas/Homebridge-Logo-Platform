import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class ThermostatPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    private fakegatoService;
    private subs;
    services: Service[];
    private platform;
    private device;
    private pushButton;
    private logging;
    private updateCurrentHeatingCoolingStateQueued;
    private updateTargetHeatingCoolingStateQueued;
    private updateCurrentTemperatureQueued;
    private updateTargetTemperatureQueued;
    private accStates;
    name: string;
    isParentAccessory: boolean;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    setTargetHeatingCoolingState(value: CharacteristicValue): Promise<void>;
    setTargetTemperature(value: CharacteristicValue): Promise<void>;
    getCurrentHeatingCoolingState(): Promise<CharacteristicValue>;
    getTargetHeatingCoolingState(): Promise<CharacteristicValue>;
    getCurrentTemperature(): Promise<CharacteristicValue>;
    getTargetTemperature(): Promise<CharacteristicValue>;
    getTemperatureDisplayUnits(): Promise<CharacteristicValue>;
    updateCurrentHeatingCoolingState(): void;
    updateTargetHeatingCoolingState(): void;
    updateCurrentTemperature(): void;
    updateTargetTemperature(): void;
    logAccessory(): void;
}
//# sourceMappingURL=thermostatPlatformAccessory.d.ts.map