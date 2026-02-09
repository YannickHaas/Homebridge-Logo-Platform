import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class CarbonDioxideSensorPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    private fakegatoService;
    services: Service[];
    private platform;
    private device;
    private logging;
    private updateCarbonDioxideDetectedQueued;
    private updateCarbonDioxideLevelQueued;
    private updateCarbonDioxidePeakLevelQueued;
    private sensStates;
    name: string;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    getCarbonDioxideDetected(): Promise<CharacteristicValue>;
    getCarbonDioxideLevel(): Promise<CharacteristicValue>;
    getCarbonDioxidePeakLevel(): Promise<CharacteristicValue>;
    updateCarbonDioxideDetected(): void;
    updateCarbonDioxideLevel(): void;
    updateCarbonDioxidePeakLevel(): void;
    logAccessory(): void;
}
//# sourceMappingURL=carbonDioxideSensorPlatformAccessory.d.ts.map