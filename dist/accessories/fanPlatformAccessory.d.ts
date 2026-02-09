import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class FanPlatformAccessory implements AccessoryPlugin {
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
    private updateOnQueued;
    private updateRotationDirectionQueued;
    private updateRotationSpeedQueued;
    private accStates;
    name: string;
    isParentAccessory: boolean;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    setOn(value: CharacteristicValue): Promise<void>;
    setRotationDirection(value: CharacteristicValue): Promise<void>;
    setRotationSpeed(value: CharacteristicValue): Promise<void>;
    getOn(): Promise<CharacteristicValue>;
    getRotationDirection(): Promise<CharacteristicValue>;
    getRotationSpeed(): Promise<CharacteristicValue>;
    updateOn(): void;
    updateRotationDirection(): void;
    updateRotationSpeed(): void;
    logAccessory(): void;
}
//# sourceMappingURL=fanPlatformAccessory.d.ts.map