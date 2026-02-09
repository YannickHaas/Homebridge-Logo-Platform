import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class LightbulbPlatformAccessory implements AccessoryPlugin {
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
    private updateOnQueued;
    private updateBrightnessQueued;
    private withBrightness;
    private accStates;
    name: string;
    isParentAccessory: boolean;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    getServices(): Service[];
    setOn(value: CharacteristicValue): Promise<void>;
    getOn(): Promise<CharacteristicValue>;
    setBrightness(value: CharacteristicValue): Promise<void>;
    getBrightness(): Promise<CharacteristicValue>;
    updateOn(): void;
    updateBrightness(): void;
    logAccessory(): void;
}
//# sourceMappingURL=lightbulbPlatformAccessory.d.ts.map