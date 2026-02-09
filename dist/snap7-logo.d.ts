export declare enum Area {
    S7AreaPE = 129,
    S7AreaPA = 130,
    S7AreaMK = 131,
    S7AreaDB = 132,
    S7AreaCT = 28,
    S7AreaTM = 29
}
export declare enum WordLen {
    S7WLBit = 1,
    S7WLByte = 2,
    S7WLChar = 3,
    S7WLWord = 4,
    S7WLInt = 5,
    S7WLDWord = 6,
    S7WLDInt = 7,
    S7WLReal = 8,
    S7WLCounter = 28,
    S7WLTimer = 29
}
export declare class LogoAddress {
    addr: number;
    bit: number;
    wLen: WordLen;
    constructor(addr: number, bit: number, wLen: WordLen);
}
export declare class Snap7Logo {
    type: string;
    ipAddr: string;
    local_TSAP: number;
    remote_TSAP: number;
    db: number;
    debugMsgLog: number;
    log: Function;
    retryCnt: number;
    s7client: any;
    constructor(type: string, ipAddr: string, local_TSAP: number, remote_TSAP: number, debug: number, logFunction: any, retrys: number);
    ReadLogo(item: string, callBack: (value: number) => any): void;
    WriteLogo(item: string, value: number): void;
    ConnectS7(s7client: any, debugLog: number, retryCount: number, callBack?: (success: Boolean) => any): boolean;
    DisconnectS7(): void;
    ReadAreaS7(s7client: any, db: number, target: LogoAddress, debugLog: number, retryCount: number, callBack: (success: number) => any): number | undefined;
    DBReadS7(s7client: any, db: number, target: LogoAddress, debugLog: number, retryCount: number, callBack: (success: number) => any): number | undefined;
    WriteAreaS7(s7client: any, db: number, target: LogoAddress, debugLog: number, retryCount: number, buffer: Buffer, callBack: (success: Boolean) => any): number | undefined;
    DBWriteS7(s7client: any, db: number, target: LogoAddress, debugLog: number, retryCount: number, buffer: Buffer, callBack: (success: Boolean) => any): number | undefined;
    getAddressAndBit(name: string, target_type: string): LogoAddress;
    isValidLogoAddress(name: string): boolean;
    isAnalogLogoAddress(name: string): boolean;
    getWordSize(wordLen: Number): 0 | 1 | 2 | 4;
    static calculateBit(base: number, num: number): LogoAddress;
    static calculateWord(base: number, num: number): LogoAddress;
}
//# sourceMappingURL=snap7-logo.d.ts.map