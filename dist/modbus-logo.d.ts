export declare enum AddressType {
    MBATDiscreteInput = 0,
    MBATCoil = 1,
    MBATInputRegister = 2,
    MBATHoldingRegister = 3
}
export declare enum WordLen {
    MBWLBit = 0,
    MBWLByte = 1,
    MBWLWord = 2,
    MBWLDWord = 3
}
export declare class LogoAddress {
    addr: number;
    type: AddressType;
    wLen: WordLen;
    readOnly: Boolean;
    constructor(addr: number, type: AddressType, wLen: WordLen, readOnly: Boolean);
}
export declare class ModBusLogo {
    ip: string;
    port: number;
    debugMsgLog: number;
    log: Function;
    retryCnt: number;
    constructor(ip: string, port: number, debug: number, logFunction: any, retrys: number);
    ReadLogo(item: string, callBack: (value: number) => any): number | undefined;
    WriteLogo(item: string, value: number): number | undefined;
    DisconnectS7(): void;
    readDiscreteInput(addr: LogoAddress, callBack: (value: number) => any, debugLog: number, log: any, retryCount: number): number | undefined;
    readCoil(addr: LogoAddress, callBack: (value: number) => any, debugLog: number, log: any, retryCount: number): number | undefined;
    readInputRegister(addr: LogoAddress, callBack: (value: number) => any, debugLog: number, log: any, retryCount: number): number | undefined;
    readHoldingRegister(addr: LogoAddress, callBack: (value: number) => any, debugLog: number, log: any, retryCount: number): number | undefined;
    writeCoil(addr: number, state: Boolean, debugLog: number, log: any, retryCount: number): number | undefined;
    writeRegister(addr: number, value: number, debugLog: number, log: any, retryCount: number): number | undefined;
    writeRegisters(addr: number, value: number[], debugLog: number, log: any, retryCount: number): number | undefined;
    logError(log: any, err: Error, debugLog: number, retryCount: number): void;
    getLogoAddress(name: string): LogoAddress;
    isValidLogoAddress(name: string): boolean;
    isAnalogLogoAddress(name: string): boolean;
}
//# sourceMappingURL=modbus-logo.d.ts.map