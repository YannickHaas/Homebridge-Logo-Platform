import { AccessoryPlugin, API, Service, CharacteristicValue } from 'homebridge';
export declare class BlindPlatformAccessory implements AccessoryPlugin {
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
    private updateCurrentPositionAndTargetPositionQueued;
    private updateCurrentPositionQueued;
    private updateTargetPositionQueued;
    private updatePositionStateQueued;
    private currentPositionIsTargetPositionInLogo;
    private accStates;
    name: string;
    isParentAccessory: boolean;
    constructor(api: API, platform: any, device: any, parent?: any);
    errorCheck(): void;
    checkPosition(): number;
    getServices(): Service[];
    setTargetPosition(value: CharacteristicValue): Promise<void>;
    setHoldPosition(value: CharacteristicValue): Promise<void>;
    getCurrentPosition(): Promise<CharacteristicValue>;
    getPositionState(): Promise<CharacteristicValue>;
    getTargetPosition(): Promise<CharacteristicValue>;
    updateCurrentPosition(): void;
    updatePositionState(): void;
    updateTargetPosition(): void;
    updateCurrentPositionAndTargetPosition(): void;
    logAccessory(): void;
    blindLogoPosToHomebridgePos(value: number, convert: boolean): number;
    blindLogoStateToHomebridgeState(value: number, convert: boolean): number;
}
//# sourceMappingURL=blindPlatformAccessory.d.ts.map