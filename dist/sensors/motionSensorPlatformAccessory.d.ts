import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class MotionSensorPlatformAccessory implements AccessoryPlugin {
    private model;
    private api;
    private service;
    private information;
    private fakegatoService;
    services: Service[];
    private platform;
    private device;
    private logging;
    private updateMotionDetectedQueued;
    private sensStates;
    name: string;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    getMotionDetected(): Promise<CharacteristicValue>;
    updateMotionDetected(): void;
    logAccessory(): void;
}
//# sourceMappingURL=motionSensorPlatformAccessory.d.ts.map